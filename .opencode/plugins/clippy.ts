import type { Plugin } from "@opencode-ai/plugin";
import * as net from "net";
import * as os from "os";
import * as path from "path";

// ============================================================
// Tips Engine (inlined)
// ============================================================

interface PluginEvent {
  type: string;
  tool?: string;
  error?: boolean;
  filePath?: string;
  timestamp: number;
}

interface Tip {
  title: string;
  body: string;
  animation: string;
}

type PatternMatcher = (events: PluginEvent[]) => Tip | null;

class TipsEngine {
  private events: PluginEvent[] = [];
  private cooldowns: Map<string, number> = new Map();
  private firstEditSent = false;

  onSessionCreated(): void { this.firstEditSent = false; }

  pushEvent(event: PluginEvent): Tip | null {
    this.events.push(event);
    const now = Date.now();
    this.events = this.events.filter((e) => now - e.timestamp < 30000);
    if (this.events.length > 20) this.events = this.events.slice(-20);

    const patterns: Array<{ id: string; matcher: PatternMatcher }> = [
      { id: "repeated-errors", matcher: (evts) => {
        const errs = evts.filter((e) => e.type === "tool.execute.after" && e.error && now - e.timestamp < 60000);
        return errs.length >= 3 ? { title: "It looks like you're running into errors!", body: "Would you like me to suggest checking the error logs?", animation: "GetAttention" } : null;
      }},
      { id: "test-file-read", matcher: (evts) => {
        const last = evts[evts.length - 1];
        return last?.type === "tool.execute.before" && last.tool === "read" && last.filePath && /\.(test|spec)\.|__tests__\//.test(last.filePath)
          ? { title: "It looks like you're working on tests!", body: "Remember to run them after making changes.", animation: "GetAttention" } : null;
      }},
      { id: "config-file-edit", matcher: (evts) => {
        const last = evts[evts.length - 1];
        return last?.type === "file.edited" && last.filePath && /\.(env|json|ya?ml|toml|config\.)/.test(last.filePath)
          ? { title: "It looks like you're editing configuration!", body: "Double-check for typos — config errors can be sneaky.", animation: "GetAttention" } : null;
      }},
      { id: "first-edit", matcher: (evts) => {
        if (this.firstEditSent) return null;
        const last = evts[evts.length - 1];
        if (last?.type === "tool.execute.before" && last.tool === "edit") { this.firstEditSent = true; return { title: "It looks like you're about to make your first change!", body: "I'll keep an eye on things.", animation: "GetAttention" }; }
        return null;
      }},
    ];

    for (const p of patterns) {
      const lastFired = this.cooldowns.get(p.id);
      if (lastFired && now - lastFired < 300000) continue;
      const tip = p.matcher(this.events);
      if (tip) { this.cooldowns.set(p.id, now); return tip; }
    }
    return null;
  }
}

// ============================================================
// Plugin — uses Unix socket / named pipe (no WebSocket, no ws dependency)
// ============================================================

const IPC_PATH = process.platform === "win32"
  ? "\\\\.\\pipe\\opencode-clippy"
  : path.join(os.tmpdir(), "opencode-clippy.sock");

const RECONNECT_MS = 1000;
const HEARTBEAT_MS = 5000;

const ClippyPlugin: Plugin = async ({ client }) => {
  let socket: net.Socket | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let currentSessionID: string | null = null;
  const tips = new TipsEngine();
  tips.onSessionCreated();

  function log(level: "info" | "warn" | "error", msg: string) {
    client.app.log({ body: { service: "clippy", level, message: msg } });
  }

  function send(msg: object): void {
    if (socket && !socket.destroyed && socket.writable) {
      try {
        socket.write(JSON.stringify(msg) + "\n");
      } catch {
        cleanup();
        reconnect();
      }
    } else {
      reconnect();
    }
  }

  function cleanup(): void {
    if (heartbeat) { clearInterval(heartbeat); heartbeat = null; }
    if (socket) { try { socket.destroy(); } catch {} socket = null; }
  }

  function connect(): void {
    cleanup();
    try {
      socket = net.createConnection(IPC_PATH, () => {
        log("info", `Connected to Clippy at ${IPC_PATH}`);
        heartbeat = setInterval(() => {
          try { send({ type: "ping" }); } catch { cleanup(); reconnect(); }
        }, HEARTBEAT_MS);
      });

      socket.on("close", () => {
        cleanup();
        reconnect();
      });

      socket.on("error", (err) => {
        log("warn", `IPC error: ${err.message}`);
        cleanup();
      });
    } catch (e: unknown) {
      log("warn", `Connect exception: ${e}`);
      reconnect();
    }
  }

  function reconnect(): void {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => { reconnectTimer = null; connect(); }, RECONNECT_MS);
  }

  function forward(eventType: string, detail?: { tool?: string; error?: boolean; filePath?: string }): void {
    send({ type: "event", event: eventType, ...detail });
    const tip = tips.pushEvent({ type: eventType, ...detail, timestamp: Date.now() });
    if (tip) send({ type: "tip", ...tip });
  }

  connect();
  log("info", "Clippy gateway loaded (IPC)");

  return {
    event: async ({ event }: { event: { type: string; properties?: Record<string, unknown> } }) => {
      const t = event.type;
      const p = (event.properties || {}) as Record<string, unknown>;

      // Track session ID (from notificator pattern)
      const eventSessionID = (p.sessionID as string)
        || (p.info as Record<string, unknown>)?.id as string
        || null;

      if (t === "session.created" && eventSessionID) {
        currentSessionID = eventSessionID;
      }

      // Only forward session.idle for the current session
      if (t === "session.idle" && eventSessionID && eventSessionID !== currentSessionID) {
        return;
      }

      switch (t) {
        case "session.created":
        case "session.idle":
        case "session.deleted":
        case "session.updated":
        case "session.status":
        case "session.diff":
        case "message.updated":
        case "message.part.updated":
        case "permission.asked":
          forward(t);
          break;
        case "tool.execute.before":
          forward(t, { tool: p.tool as string, filePath: p.filePath as string });
          break;
        case "tool.execute.after":
          forward(t, { tool: p.tool as string, error: !!p.error, filePath: p.filePath as string });
          break;
        case "permission.replied":
          forward(t, { error: p.denied as boolean });
          break;
        case "file.edited":
          forward(t, { filePath: p.filePath as string });
          break;
        default:
          forward(t);
          break;
      }
    },
    "permission.ask": async (input: { type: string }, _output: unknown) => {
      forward("permission.asked", { tool: input.type });
    },
  };
};

export default ClippyPlugin;
