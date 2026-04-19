## 1. Project Scaffolding

- [x] 1.1 Initialize project with `package.json`, TypeScript config, and directory structure (`plugin/`, `widget/`, `assets/`)
- [x] 1.2 Download Clippy assets (`map.png`, `animations.json`) from felixrieseberg/clippy into `assets/`
- [x] 1.3 Add dependencies: `electron`, `electron-builder`, `ws`, `lottie-web`, `@opencode-ai/plugin` (dev), and build tooling
- [x] 1.4 Configure Electron build with Vite (renderer) and TypeScript (main process) with cross-platform targets (macOS, Windows, Linux)

## 2. Animation Engine

- [x] 2.1 Create `widget/renderer/animation-engine.ts` — Canvas-based sprite renderer that reads `animations.json` frame data and clips from `map.png`
- [x] 2.2 Implement animation queue with `high`/`normal` priority levels and interruption logic
- [x] 2.3 Implement idle animation loop: random idle animation after 3s pause with RestPose in between
- [x] 2.4 Test all 42 animations render correctly (manual visual verification with a test harness page)

## 3. Event-to-Animation Mapping

- [x] 3.1 Create `widget/renderer/event-mapping.ts` — static mapping table from OpenCode events to animation names, priorities, and tip text
- [x] 3.2 Implement tool-name-aware sub-mapping for `tool.execute.before` (read→Searching, edit→Writing, bash→GetTechy)
- [x] 3.3 Implement event debouncing (500ms window for normal events, no debounce for high-priority)
- [x] 3.4 Implement fallback to `IdleEyeBrowRaise` for unknown events

## 4. Speech Bubble

- [x] 4.1 Create `widget/renderer/speech-bubble.ts` — DOM-based speech bubble replicating the classic Windows 98 Clippy tooltip: `#FFFFE1` yellow background, 1px black border, sharp corners (no border-radius), 2px dark gray (`#808080`) drop shadow on bottom-right, triangular tail from bottom-left pointing toward Clippy, Tahoma/MS Sans Serif 11px font
- [x] 4.2 Implement speech bubble Lottie pop-in/pop-out transitions using `speech-pop.json`
- [x] 4.3 Implement two bubble modes: **status** (plain text, max-width 250px, 4s auto-dismiss) and **proactive tip** (bold title + regular body, max-width 300px, "x" close button, 8s auto-dismiss) — both in the same classic yellow tooltip style
- [x] 4.4 Implement click-to-dismiss and close-button-to-dismiss behavior
- [x] 4.5 Implement dismiss-on-next-animation (pop out current bubble when new animation starts)

## 5. Proactive Tips Engine

- [x] 5.1 Create `plugin/tips-engine.ts` — sliding event window (circular buffer, max 20 events / 30s)
- [x] 5.2 Implement pattern matcher framework: each pattern is a function `(events: Event[]) => Tip | null`
- [x] 5.3 Implement tip patterns: repeated errors (3+ in 60s), test file reads, rapid edits to same file, git commands, idle after session start, repeated permission denials, first edit in session, config file edits
- [x] 5.4 Implement 5-minute per-pattern cooldown to prevent nagging
- [x] 5.5 Wire tip engine into plugin event handler — on match, send `{ type: "tip", title, body, animation }` to widget
- [x] 5.6 Widget renders tip messages with bold title ("It looks like you're...") + body text, plays GetAttention → Explain animation sequence

## 6. Lottie Effects Layer

- [x] 6.1 Create `widget/renderer/lottie-effects.ts` — Lottie rendering layer using `lottie-web`, positioned as overlay above the Canvas sprite
- [x] 6.2 Source or create 6 Lottie JSON assets: `sparkles.json`, `confetti.json`, `alert-pulse.json`, `thinking-dots.json`, `speech-pop.json`, `wave-lines.json` — place in `assets/lottie/`
- [x] 6.3 Implement effect-to-event mapping: sparkles→success, confetti→congratulate, alert-pulse→permission/alert, thinking-dots→thinking, wave-lines→greeting/goodbye
- [x] 6.4 Implement effect lifecycle: fire-and-forget for single-play, auto-stop looping effects when triggering Clippy animation ends
- [x] 6.5 Preload all Lottie JSON at widget startup for instant playback

## 7. Desktop Widget (Electron)

- [x] 7.1 Create `widget/main/main.ts` — Electron main process with transparent, frameless, always-on-top BrowserWindow (300x250px), cross-platform compatible
- [x] 7.2 Implement initial positioning at bottom-right of primary display with 50px offset (using `screen.getPrimaryDisplay()`)
- [x] 7.3 Implement Linux compositor detection — fall back to solid #c0c0c0 background when no compositor is available
- [x] 7.4 Implement window dragging via `-webkit-app-region: drag` on the sprite area
- [x] 7.5 Create `widget/renderer/index.html` and `renderer.ts` — Canvas + Lottie overlay + speech bubble composition
- [x] 7.6 Parse `--port` CLI argument and start WebSocket server on that port
- [x] 7.7 Implement heartbeat timeout — auto-close after 10s without ping

## 8. OpenCode Plugin

- [x] 8.1 Create `.opencode/plugins/clippy.ts` — plugin entry point exporting the `Plugin` function
- [x] 8.2 Implement widget process spawning on `session.created` (find available port, spawn detached Electron process, resolve binary path cross-platform)
- [x] 8.3 Implement WebSocket client connection with exponential backoff reconnection (max 5 retries)
- [x] 8.4 Implement event forwarding — subscribe to OpenCode events and send JSON messages to widget
- [x] 8.5 Integrate proactive tips engine — run pattern matcher on each event, forward tips to widget
- [x] 8.6 Implement 5-second heartbeat ping loop
- [x] 8.7 Handle widget process lifecycle — kill on session end, reuse if already running

## 9. Integration & Polish

- [x] 9.1 End-to-end test: start OpenCode with plugin, verify Clippy appears, reacts to events with Lottie effects, and shows proactive tips
- [x] 9.2 Add `README.md` with installation instructions and screenshots
- [x] 9.3 Add npm scripts: `build`, `dev` (widget only), and `package` (distribute Electron app)
- [x] 9.4 Configure `electron-builder` for cross-platform packaging: `.dmg` (macOS), `.exe`/NSIS (Windows), `.AppImage`/`.deb` (Linux)
- [x] 9.5 Test widget on macOS, Windows, and Linux (verify transparency, always-on-top, dragging, positioning, Lottie effects)
- [x] 9.6 Verify resource usage is within bounds (~30-50MB RAM for widget process)
