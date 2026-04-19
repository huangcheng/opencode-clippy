import type { Plugin } from "@opencode-ai/plugin";
import { TipsEngine, getIPCPath } from "@opencode-clippy/shared";
import * as net from "net";

// ============================================================
// Plugin — uses Unix socket / named pipe (no WebSocket, no ws dependency)
// ============================================================

const IPC_PATH = getIPCPath();

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
