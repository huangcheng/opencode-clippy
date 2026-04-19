## Why

The Clippy widget currently only uses 20 of the 43 available animations during idle state, and the widget is entirely passive — users cannot interact with it. Adding more idle variety and mouse-driven interactions (click, drag) will make Clippy feel alive and fun, matching the original Office assistant's personality.

## What Changes

- **Expand idle animation pool** — use all 43 available animations during idle, not just the current 20, with weighted randomization so common idles play more often than dramatic ones
- **Click interactions** — clicking Clippy triggers a reaction animation (e.g., Wave, GetAttention) and optionally shows a random tip in the speech bubble
- **Drag-to-move** — users can click and drag Clippy to reposition the widget anywhere on screen; Clippy plays a movement animation while being dragged and a settle animation when released
- **Double-click interaction** — double-clicking triggers a special animation sequence (e.g., GetWizardy, GetArtsy)
- **Remember window position** — persist the widget's screen position to `~/.opencode-clippy/config.json` so it stays where the user put it across restarts

## Capabilities

### New Capabilities
- `idle-animation-variety`: Expanded idle animation pool with weighted randomization across all 43 animations
- `click-interactions`: Click and double-click reactions with animations and speech bubbles
- `drag-to-move`: Drag-based widget repositioning with movement animations and position persistence

### Modified Capabilities

## Impact

- `packages/desktop/src/widget/renderer/animation-engine.ts` — expand IDLE_ANIMATIONS list, add weighted random selection
- `packages/desktop/src/widget/renderer/renderer.ts` — add click/double-click event listeners, wire up drag handling
- `packages/desktop/src/widget/main/main.ts` — handle window move IPC, persist position to config file, load saved position on startup
- `packages/desktop/src/widget/preload/preload.ts` — expose window move and position APIs via context bridge
