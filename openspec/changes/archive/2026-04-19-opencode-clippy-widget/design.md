## Context

OpenCode is a terminal-based AI coding assistant. Users interact with it entirely through the CLI. There is no visual feedback outside the terminal — no status indicators, no ambient awareness of what OpenCode is doing.

The [felixrieseberg/clippy](https://github.com/felixrieseberg/clippy) project provides a complete set of Clippy sprite assets: a `map.png` sprite sheet (124x93px frames) and `animations.json` with 42 named animations and per-frame timing data. These assets are battle-tested and freely available.

OpenCode's plugin system exposes 30+ event hooks (`session.*`, `tool.*`, `message.*`, `permission.*`, etc.) and supports TypeScript plugins loaded from `.opencode/plugins/`.

## Goals / Non-Goals

**Goals:**
- Render a Clippy desktop widget as an always-on-top transparent window that sits alongside the terminal
- React to OpenCode events with contextually appropriate Clippy animations
- Show speech bubble tips that provide useful context about what OpenCode is doing
- Be zero-config: plugin auto-launches the widget, no manual setup beyond install
- Keep resource usage minimal (~30-50MB RAM for the Electron process)

**Non-Goals:**
- Clippy does NOT interact with OpenCode (no sending commands back)
- No user-configurable animation mappings in v1
- No custom Clippy skins or alternative agents
- Not a general-purpose desktop assistant — purely an OpenCode companion
- No platform-specific native integrations (e.g., macOS menu bar, Windows system tray) in v1

## Decisions

### 1. Electron for the desktop widget

**Choice**: Electron with a transparent, frameless, always-on-top BrowserWindow.

**Why**: We need a cross-platform native desktop window that can render sprite animations with transparency on macOS, Windows, and Linux. Electron provides this with minimal effort — `transparent: true`, `frame: false`, `alwaysOnTop: true` — and works identically across all three platforms. The Clippy assets are already web-ready (PNG sprites + JSON frame data).

**Cross-platform notes**:
- **Linux**: Transparent windows require a compositing window manager (most modern desktops — GNOME, KDE, etc.). On non-compositing WMs, fall back to a solid background.
- **Windows**: Transparent windows work natively. Always-on-top works via `SetWindowPos` under the hood.
- **macOS**: Works out of the box. May trigger accessibility prompts for always-on-top.

**Alternatives considered**:
- **Swift/AppKit native**: macOS-only — doesn't meet the cross-platform requirement.
- **Tauri**: Lighter than Electron (~10MB vs ~50MB), but transparent window support varies across platforms (especially Linux/Wayland) and build tooling is more complex for cross-platform distribution.

### 2. WebSocket for plugin↔widget IPC

**Choice**: Local WebSocket server running in the Electron widget, with the OpenCode plugin as the client.

**Why**: OpenCode plugins run in a Bun process. The widget is a separate Electron process. WebSocket is the simplest cross-process communication that works reliably — no file watchers, no Unix sockets, no complex IPC. The plugin connects to `ws://localhost:<port>` and sends JSON event messages.

**Alternatives considered**:
- **stdout/stdin pipe**: Would require the plugin to spawn and manage the Electron process lifecycle directly. More brittle.
- **File-based (tmp file watching)**: High latency, unreliable ordering, cleanup issues.
- **Unix domain sockets**: Slightly lower overhead but harder to debug and no browser-native support.

### 3. Sprite sheet animation in Canvas

**Choice**: HTML5 Canvas element rendering frames from the Clippy sprite sheet (`map.png`) using `animations.json` timing data.

**Why**: The original Clippy assets use a single sprite sheet with frame coordinates. Canvas `drawImage` with source rect clipping is the most performant way to render this. No need for CSS sprite hacks or individual frame images.

### 3b. Lottie for UI effects (hybrid approach)

**Choice**: Use `lottie-web` to render vector-based UI effects overlaid on the Clippy sprite — speech bubble entrance/exit, success sparkles, error pulses, confetti on congratulate, thinking dots, etc.

**Why**: Clippy's 42 character animations are raster pixel-art sprites — converting them to Lottie would require recreating all art from scratch. But UI effects around Clippy (particle effects, transitions, emphasis animations) are perfect for Lottie: smooth vector animations, tiny JSON files, GPU-accelerated rendering. This hybrid gives us the best of both worlds — authentic Clippy character art plus polished, modern UI effects.

**Lottie effects catalog**:
| Effect | Trigger | Description |
|--------|---------|-------------|
| `sparkles.json` | `tool.execute.after` (success) | Gold sparkles around Clippy |
| `confetti.json` | Congratulate animation | Confetti burst |
| `alert-pulse.json` | Alert / permission.asked | Red pulsing ring |
| `thinking-dots.json` | Thinking / Processing | Animated ellipsis dots |
| `speech-pop.json` | Speech bubble enter/exit | Bubble pop-in / pop-out |
| `wave-lines.json` | Greeting / GoodBye | Radiating wave lines |

**Source**: Effects can be sourced from [LottieFiles](https://lottiefiles.com/) (free tier) or created with After Effects + Bodymovin. Tiny file sizes (~5-20KB each).

### 4. Event-to-animation mapping as a static config

**Choice**: A TypeScript map object that maps OpenCode event types to animation names + tip text.

**Why**: Simple, predictable, easy to extend. The mapping is the core UX decision and should be explicit, not dynamic. Example:
```
"session.created" → { animation: "Greeting", tip: "Hey! Let's write some code!" }
"tool.execute.before" → { animation: "Thinking", tip: "Working on it..." }
"session.idle" → { animation: "IdleSnooze", tip: null }
```

### 4b. Proactive contextual tips engine (classic Clippy behavior)

**Choice**: A pattern-matching tip engine in the plugin that analyzes sequences of OpenCode events and generates classic "It looks like you're trying to..." Clippy tips with the GetAttention animation.

**Why**: The iconic Clippy experience is proactive, context-aware tips — not just status messages. The original Clippy watched what you were doing and offered help. Our tip engine watches OpenCode events (tool calls, errors, file patterns, repeated actions) and matches them against a library of tip templates.

**Architecture**:
- The **plugin** maintains a sliding window of recent events (last 30 seconds / 20 events)
- A **pattern matcher** runs against the event window on each new event
- When a pattern matches, the plugin sends a `{ type: "tip", tip: { title, body, animation } }` message to the widget
- The widget renders the tip in the speech bubble with the authentic Windows 98 Clippy tooltip look: `#FFFFE1` yellow background, sharp corners, 1px black border, `#808080` drop shadow, Tahoma 11px font — bold title line ("It looks like you're...") + regular body text
- Tips have a **cooldown** per pattern (5 minutes) to avoid nagging

**Tip patterns catalog**:

| Pattern | Title | Body |
|---------|-------|------|
| 3+ `tool.execute.after` errors in 60s | "It looks like you're running into errors!" | "Would you like me to suggest checking the error logs?" |
| `tool.execute.before` (read) on test files | "It looks like you're working on tests!" | "Remember to run them after making changes." |
| Multiple edits to same file in 30s | "It looks like you're making lots of changes!" | "Don't forget to save your progress." |
| `tool.execute.before` (bash) with git commands | "It looks like you're working with git!" | "Make sure to commit before switching branches." |
| Long idle after `session.created` | "It looks like you're thinking about where to start!" | "Try describing your task to OpenCode." |
| `permission.asked` repeatedly denied | "It looks like you're being cautious with permissions!" | "You can configure auto-approve for safe operations." |
| First `tool.execute.before` (edit) in session | "It looks like you're about to make your first change!" | "I'll keep an eye on things." |
| `file.edited` on config files (.env, .json, .yaml) | "It looks like you're editing configuration!" | "Double-check for typos — config errors can be sneaky." |

**Tip rendering**: Speech bubble is larger for tips (~300px wide), with a bold title line, body text, and optional close button. Uses the GetAttention animation + the Explain animation while tip is showing.

### 5. Plugin launches widget automatically

**Choice**: The OpenCode plugin spawns the Electron widget as a detached child process on `session.created`, and kills it on plugin unload.

**Why**: Zero-config experience. User installs the plugin, and Clippy just appears. The plugin manages the widget lifecycle — no separate "start clippy" step.

## Risks / Trade-offs

- **[Electron size]** Electron adds ~50MB to disk and ~30-50MB RAM → Acceptable for a fun dev tool; could migrate to Tauri in v2 if size is a concern.
- **[Port conflicts]** WebSocket on a fixed port could conflict → Use a random available port, pass it to the widget via CLI arg, and write it to a tmp file for reconnection.
- **[Widget outlives plugin]** If OpenCode crashes, the widget might stay alive → Widget has a heartbeat; if no ping received for 10s, it auto-closes.
- **[macOS permissions]** Transparent always-on-top windows may trigger accessibility prompts → Document in README; no code mitigation needed.
- **[Linux compositing]** Transparent windows require a compositing WM → Detect compositor availability; fall back to solid background color (#c0c0c0) if unavailable.
- **[Cross-platform distribution]** Electron app must be packaged for macOS (.dmg), Windows (.exe), and Linux (.AppImage/.deb) → Use `electron-builder` with platform-specific configs.
- **[Animation jank]** Rapid event bursts could queue many animations → Use an animation queue with priority levels; high-priority animations (Alert, Error) interrupt, low-priority ones (Idle) are debounced.
