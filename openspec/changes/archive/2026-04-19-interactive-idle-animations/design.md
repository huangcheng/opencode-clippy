## Context

The Clippy widget has 43 sprite animations available but only uses 20 during idle. The widget is entirely passive — users cannot interact with it beyond watching. The original Microsoft Clippy was interactive (draggable, clickable), and users expect that behavior.

The widget is an Electron app with a transparent, frameless `BrowserWindow`. The renderer uses a canvas-based `AnimationEngine` with a priority queue. IPC between main and renderer uses Electron's `contextBridge`.

## Goals / Non-Goals

**Goals:**
- Use all 43 animations during idle with weighted randomization
- Add click and double-click reactions with animations + speech bubbles
- Make the widget draggable with drag/drop animations
- Persist window position across restarts via `~/.opencode-clippy/config.json`

**Non-Goals:**
- Right-click context menu on the sprite (use existing tray menu)
- Resize or scale the widget
- Animated walking/movement between positions (widget snaps to cursor during drag)
- Custom animation authoring or user-configurable animation sets

## Decisions

### 1. Weighted idle animation categories

Animations are grouped into three weight tiers:

| Tier | Weight | Animations |
|------|--------|------------|
| Common (subtle) | 3 | All `Idle*`, `Look*`, `Hearing_1`, `CheckingSomething` |
| Medium (expressive) | 2 | `Wave`, `Greeting`, `GetArtsy`, `GetTechy`, `Thinking` |
| Rare (dramatic) | 1 | `GetWizardy`, `EmptyTrash`, `GetAttention`, `Alert`, `Processing`, `Congratulate`, `GoodBye`, `Save`, `Searching`, `Writing`, `Explain`, `Print`, `SendMail`, `Show`, `Hide`, `Gesture*` |

**Rationale**: Subtle animations feel natural for idle. Dramatic ones become special moments, not repetitive noise.

### 2. Click handling in the renderer, not main process

Mouse events are handled on the canvas element in the renderer process. No IPC needed for click reactions — the renderer already owns the `AnimationEngine` and `SpeechBubble`.

**Rationale**: Simpler, no IPC round-trip, all animation logic stays in one place.

### 3. Drag uses main process window positioning

Drag requires moving the `BrowserWindow`, which is a main-process operation. The flow:
1. Renderer detects `mousedown` on canvas → sends `drag-start` via IPC
2. Main process tracks mouse delta using `screen.getCursorScreenPoint()` and calls `win.setPosition()`
3. On `mouseup`, renderer sends `drag-end` → main saves position to config

**Alternative considered**: Using `-webkit-app-region: drag` CSS. Rejected because it doesn't let us detect drag start/end for animations, and conflicts with click detection.

### 4. Config file at `~/.opencode-clippy/config.json`

Position is stored as `{ "window": { "x": number, "y": number } }` in the same directory as the IPC socket. The file is read on startup and written on drag-end with a 500ms debounce.

**Rationale**: Reuses the existing `~/.opencode-clippy/` directory. JSON is simple and human-readable.

### 5. Click cooldown in renderer

A 1-second cooldown timer in the renderer prevents click spam. During cooldown, clicks are silently ignored. The cooldown resets after each accepted click.

**Rationale**: Simpler than debouncing — we want the first click to fire immediately, not the last.

## Risks / Trade-offs

- **[Drag conflicts with click]** → Use a distance threshold (5px) to distinguish click from drag-start. If mouse moves <5px before mouseup, treat as click.
- **[Config file write failures]** → Write with try/catch, log warning, don't crash. Position persistence is nice-to-have, not critical.
- **[Double-click vs single-click timing]** → Use a 250ms delay before firing single-click to allow double-click detection. If double-click fires, cancel the pending single-click.
