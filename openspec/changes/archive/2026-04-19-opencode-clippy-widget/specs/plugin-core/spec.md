## ADDED Requirements

### Requirement: Plugin exports valid OpenCode plugin interface
The plugin SHALL export a function conforming to the `Plugin` type from `@opencode-ai/plugin`, accepting the context object (`project`, `client`, `$`, `directory`, `worktree`).

#### Scenario: Plugin loads successfully in OpenCode
- **WHEN** OpenCode starts and loads `.opencode/plugins/clippy.ts`
- **THEN** the plugin initializes without errors and registers event hooks

### Requirement: Plugin subscribes to OpenCode events
The plugin SHALL register handlers for the following event categories: `session.created`, `session.idle`, `session.deleted`, `tool.execute.before`, `tool.execute.after`, `message.part.updated`, `permission.asked`, `permission.replied`.

#### Scenario: Session created event triggers greeting
- **WHEN** OpenCode emits `session.created`
- **THEN** the plugin sends a `{ type: "event", event: "session.created" }` message to the widget via WebSocket

#### Scenario: Tool execution event triggers thinking animation
- **WHEN** OpenCode emits `tool.execute.before`
- **THEN** the plugin sends the event with tool name to the widget

### Requirement: Plugin spawns widget process on session start
The plugin SHALL spawn the Electron widget as a detached child process when `session.created` fires, passing the WebSocket port as a CLI argument.

#### Scenario: Widget process starts on first session
- **WHEN** `session.created` fires and no widget process is running
- **THEN** the plugin spawns `electron widget/main.js --port <port>` as a detached process

#### Scenario: Widget process already running
- **WHEN** `session.created` fires and a widget process is already alive
- **THEN** the plugin reuses the existing connection without spawning a new process

### Requirement: Plugin establishes WebSocket connection
The plugin SHALL create a WebSocket client connecting to `ws://localhost:<port>` where `<port>` is a randomly assigned available port.

#### Scenario: WebSocket connection established
- **WHEN** the widget process starts and the WebSocket server is ready
- **THEN** the plugin connects and begins forwarding events

#### Scenario: WebSocket connection lost
- **WHEN** the WebSocket connection drops
- **THEN** the plugin attempts reconnection with exponential backoff (max 5 retries, 1s/2s/4s/8s/16s)

### Requirement: Plugin sends heartbeat to widget
The plugin SHALL send a `{ type: "ping" }` message every 5 seconds to keep the widget alive.

#### Scenario: Heartbeat keeps widget alive
- **WHEN** the plugin sends pings every 5 seconds
- **THEN** the widget remains open and responsive

#### Scenario: Plugin stops sending heartbeats
- **WHEN** no ping is received by the widget for 10 seconds
- **THEN** the widget auto-closes
