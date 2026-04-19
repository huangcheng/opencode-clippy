export interface PluginEvent {
  type: string;
  tool?: string;
  error?: boolean;
  filePath?: string;
  timestamp: number;
}

export interface Tip {
  title: string;
  body: string;
  animation: string;
}

type PatternMatcher = (events: PluginEvent[]) => Tip | null;

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const MAX_EVENTS = 20;
const WINDOW_MS = 30 * 1000; // 30 seconds

export class TipsEngine {
  private events: PluginEvent[] = [];
  private cooldowns: Map<string, number> = new Map();
  private sessionStartTime = 0;
  private firstEditSent = false;
  private patterns: Array<{ id: string; matcher: PatternMatcher }>;

  constructor() {
    this.patterns = [
      { id: "repeated-errors", matcher: this.repeatedErrors.bind(this) },
      { id: "test-file-read", matcher: this.testFileRead.bind(this) },
      { id: "rapid-edits", matcher: this.rapidEdits.bind(this) },
      { id: "git-commands", matcher: this.gitCommands.bind(this) },
      { id: "idle-after-start", matcher: this.idleAfterStart.bind(this) },
      { id: "permission-denials", matcher: this.permissionDenials.bind(this) },
      { id: "first-edit", matcher: this.firstEdit.bind(this) },
      { id: "config-file-edit", matcher: this.configFileEdit.bind(this) },
    ];
  }

  onSessionCreated(): void {
    this.sessionStartTime = Date.now();
    this.firstEditSent = false;
  }

  pushEvent(event: PluginEvent): Tip | null {
    this.events.push(event);
    this.pruneEvents();

    for (const pattern of this.patterns) {
      if (this.isOnCooldown(pattern.id)) continue;

      const tip = pattern.matcher(this.events);
      if (tip) {
        this.cooldowns.set(pattern.id, Date.now());
        return tip;
      }
    }

    return null;
  }

  // Check for idle-after-start (called on a timer, not on event push)
  checkIdleTip(): Tip | null {
    if (this.isOnCooldown("idle-after-start")) return null;

    const nonSessionEvents = this.events.filter(
      (e) => e.type !== "session.created"
    );
    if (
      nonSessionEvents.length === 0 &&
      this.sessionStartTime > 0 &&
      Date.now() - this.sessionStartTime > 15000
    ) {
      this.cooldowns.set("idle-after-start", Date.now());
      return {
        title: "It looks like you're thinking about where to start!",
        body: "Try describing your task to OpenCode.",
        animation: "GetAttention",
      };
    }
    return null;
  }

  private pruneEvents(): void {
    const now = Date.now();
    // Remove events older than 30s
    this.events = this.events.filter((e) => now - e.timestamp < WINDOW_MS);
    // Keep max 20
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(-MAX_EVENTS);
    }
  }

  private isOnCooldown(patternId: string): boolean {
    const lastFired = this.cooldowns.get(patternId);
    if (!lastFired) return false;
    return Date.now() - lastFired < COOLDOWN_MS;
  }

  // Pattern: 3+ errors in 60s
  private repeatedErrors(events: PluginEvent[]): Tip | null {
    const now = Date.now();
    const recentErrors = events.filter(
      (e) =>
        e.type === "tool.execute.after" &&
        e.error &&
        now - e.timestamp < 60000
    );
    if (recentErrors.length >= 3) {
      return {
        title: "It looks like you're running into errors!",
        body: "Would you like me to suggest checking the error logs?",
        animation: "GetAttention",
      };
    }
    return null;
  }

  // Pattern: reading test files
  private testFileRead(events: PluginEvent[]): Tip | null {
    const last = events[events.length - 1];
    if (
      last?.type === "tool.execute.before" &&
      last.tool === "read" &&
      last.filePath &&
      /\.(test|spec)\.|__tests__\//.test(last.filePath)
    ) {
      return {
        title: "It looks like you're working on tests!",
        body: "Remember to run them after making changes.",
        animation: "GetAttention",
      };
    }
    return null;
  }

  // Pattern: 3+ edits to same file in 30s
  private rapidEdits(events: PluginEvent[]): Tip | null {
    const now = Date.now();
    const recentEdits = events.filter(
      (e) =>
        e.type === "file.edited" && e.filePath && now - e.timestamp < 30000
    );

    const fileCounts = new Map<string, number>();
    for (const e of recentEdits) {
      const count = (fileCounts.get(e.filePath!) || 0) + 1;
      fileCounts.set(e.filePath!, count);
      if (count >= 3) {
        return {
          title: "It looks like you're making lots of changes!",
          body: "Don't forget to save your progress.",
          animation: "GetAttention",
        };
      }
    }
    return null;
  }

  // Pattern: git commands in bash
  private gitCommands(events: PluginEvent[]): Tip | null {
    const last = events[events.length - 1];
    if (
      last?.type === "tool.execute.before" &&
      last.tool === "bash" &&
      last.filePath &&
      /\bgit\s+(commit|push|checkout|merge|rebase|reset)\b/.test(last.filePath)
    ) {
      return {
        title: "It looks like you're working with git!",
        body: "Make sure to commit before switching branches.",
        animation: "GetAttention",
      };
    }
    return null;
  }

  // Pattern: idle after session start (handled by checkIdleTip)
  private idleAfterStart(_events: PluginEvent[]): Tip | null {
    return null;
  }

  // Pattern: 2+ permission denials in 60s
  private permissionDenials(events: PluginEvent[]): Tip | null {
    const now = Date.now();
    const denials = events.filter(
      (e) =>
        e.type === "permission.replied" &&
        e.error &&
        now - e.timestamp < 60000
    );
    if (denials.length >= 2) {
      return {
        title: "It looks like you're being cautious with permissions!",
        body: "You can configure auto-approve for safe operations.",
        animation: "GetAttention",
      };
    }
    return null;
  }

  // Pattern: first edit in session
  private firstEdit(events: PluginEvent[]): Tip | null {
    if (this.firstEditSent) return null;
    const last = events[events.length - 1];
    if (last?.type === "tool.execute.before" && last.tool === "edit") {
      this.firstEditSent = true;
      return {
        title: "It looks like you're about to make your first change!",
        body: "I'll keep an eye on things.",
        animation: "GetAttention",
      };
    }
    return null;
  }

  // Pattern: config file edits
  private configFileEdit(events: PluginEvent[]): Tip | null {
    const last = events[events.length - 1];
    if (
      last?.type === "file.edited" &&
      last.filePath &&
      /\.(env|json|ya?ml|toml|config\.)/.test(last.filePath)
    ) {
      return {
        title: "It looks like you're editing configuration!",
        body: "Double-check for typos — config errors can be sneaky.",
        animation: "GetAttention",
      };
    }
    return null;
  }
}
