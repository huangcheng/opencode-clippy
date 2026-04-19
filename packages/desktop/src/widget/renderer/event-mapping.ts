import type { Priority } from "./animation-engine";

export interface EventMapping {
  animation: string;
  priority: Priority;
  tip: string | null;
}

export interface ToolEventDetail {
  tool?: string;
  error?: boolean;
  filePath?: string;
}

const BASE_MAPPINGS: Record<string, EventMapping> = {
  "session.created": {
    animation: "Greeting",
    priority: "high",
    tip: "tip.session.created",
  },
  "session.idle": {
    animation: "Congratulate",
    priority: "high",
    tip: "tip.session.idle",
  },
  "session.deleted": {
    animation: "GoodBye",
    priority: "high",
    tip: "tip.session.deleted",
  },
  "session.updated": {
    animation: "RestPose",
    priority: "normal",
    tip: null,
  },
  "session.status": {
    animation: "RestPose",
    priority: "normal",
    tip: null,
  },
  "session.diff": {
    animation: "Writing",
    priority: "high",
    tip: "tip.session.diff",
  },
  "message.updated": {
    animation: "Thinking",
    priority: "high",
    tip: "tip.message.updated",
  },
  "message.part.updated": {
    animation: "Thinking",
    priority: "high",
    tip: "tip.message.part.updated",
  },
  "permission.asked": {
    animation: "GetAttention",
    priority: "high",
    tip: "tip.permission.asked",
  },
  "file.edited": {
    animation: "Save",
    priority: "normal",
    tip: "tip.file.edited",
  },
};

const TOOL_BEFORE_MAPPINGS: Record<string, EventMapping> = {
  read: {
    animation: "Searching",
    priority: "normal",
    tip: "tip.tool.read",
  },
  edit: {
    animation: "Writing",
    priority: "normal",
    tip: "tip.tool.edit",
  },
  bash: {
    animation: "GetTechy",
    priority: "normal",
    tip: "tip.tool.bash",
  },
};

const PERMISSION_REPLIED_MAPPINGS: Record<string, EventMapping> = {
  granted: {
    animation: "Congratulate",
    priority: "normal",
    tip: "tip.permission.granted",
  },
  denied: {
    animation: "LookDown",
    priority: "normal",
    tip: "tip.permission.denied",
  },
};

const FALLBACK_MAPPING: EventMapping = {
  animation: "IdleEyeBrowRaise",
  priority: "normal",
  tip: null,
};

export function getEventMapping(
  eventType: string,
  detail?: ToolEventDetail
): EventMapping {
  if (eventType === "tool.execute.before" && detail?.tool) {
    return TOOL_BEFORE_MAPPINGS[detail.tool] ?? {
      animation: "Thinking",
      priority: "normal",
      tip: "tip.tool.default",
    };
  }

  if (eventType === "tool.execute.after") {
    if (detail?.error) {
      return {
        animation: "Alert",
        priority: "high",
        tip: "tip.tool.error",
      };
    }
    return {
      animation: "Congratulate",
      priority: "normal",
      tip: "tip.tool.success",
    };
  }

  if (eventType === "permission.replied") {
    const key = detail?.error ? "denied" : "granted";
    return PERMISSION_REPLIED_MAPPINGS[key] ?? FALLBACK_MAPPING;
  }

  return BASE_MAPPINGS[eventType] ?? FALLBACK_MAPPING;
}

// Debouncer for normal-priority events
export class EventDebouncer {
  private timers: Map<string, number> = new Map();
  private debounceMs: number;

  constructor(debounceMs = 500) {
    this.debounceMs = debounceMs;
  }

  debounce(
    eventType: string,
    priority: Priority,
    callback: () => void
  ): void {
    // High-priority events are never debounced
    if (priority === "high") {
      callback();
      return;
    }

    const existing = this.timers.get(eventType);
    if (existing !== undefined) {
      clearTimeout(existing);
    }

    const timer = window.setTimeout(() => {
      this.timers.delete(eventType);
      callback();
    }, this.debounceMs);

    this.timers.set(eventType, timer);
  }

  destroy(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}
