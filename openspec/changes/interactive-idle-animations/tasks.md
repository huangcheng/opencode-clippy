## 1. Expanded Idle Animations

- [x] 1.1 Define weighted animation tiers (common/medium/rare) with all 43 animations in `animation-engine.ts`
- [x] 1.2 Implement weighted random selection function that picks from tiers based on weight
- [x] 1.3 Add no-immediate-repeat logic to skip the animation that just played
- [x] 1.4 Replace current `IDLE_ANIMATIONS` array and random picker with weighted selection

## 2. Click Interactions

- [x] 2.1 Add click and double-click event listeners on the canvas in `renderer.ts`
- [x] 2.2 Implement 250ms single-click delay to distinguish click from double-click
- [x] 2.3 Define click reaction animation pool and random fun tips for single-click
- [x] 2.4 Define double-click special animation pool and speech bubble messages
- [x] 2.5 Add 1-second click cooldown to prevent spam

## 3. Drag to Move

- [x] 3.1 Add `mousedown`/`mousemove`/`mouseup` listeners on canvas with 5px drag threshold
- [x] 3.2 Expose `startDrag`, `stopDrag`, and `getPosition` IPC APIs in `preload.ts`
- [x] 3.3 Implement drag handling in `main.ts` using `screen.getCursorScreenPoint()` and `win.setPosition()`
- [x] 3.4 Play drag animation on drag-start and settle animation on drag-end in renderer

## 4. Position Persistence

- [x] 4.1 Add config read/write helpers for `~/.opencode-clippy/config.json` in main process
- [x] 4.2 Load saved position on startup and pass to `BrowserWindow` constructor
- [x] 4.3 Save position on drag-end with 500ms debounce

## 5. Build & Test

- [x] 5.1 Build full workspace and verify no TypeScript errors
- [x] 5.2 Manual test: idle animations cycle through variety without immediate repeats
- [x] 5.3 Manual test: click triggers reaction, double-click triggers special animation, rapid clicks are throttled
- [x] 5.4 Manual test: drag moves widget, position persists across restart
