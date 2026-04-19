## Why

All UI strings (speech bubbles, tips, tray menu, about dialog) are hardcoded in English. Non-English speakers can't use Clippy comfortably. The "Launch at Login" toggle is buried in the tray menu with no room for additional settings like language selection. A proper settings modal gives a home for both existing and future preferences.

## What Changes

- **i18n system** — add a locale registry with translation dictionaries for English (`en`) and Simplified Chinese (`zh-CN`), covering all speech bubble tips, click reactions, event mapping tips, tray menu labels, about dialog text, and settings UI labels
- **Settings modal** — a new renderer-side modal (opened via tray menu "Settings") with two controls: language dropdown and "Launch at Login" checkbox
- **Move "Launch at Login"** from tray menu checkbox into the settings modal
- **Persist language preference** in `~/.opencode-clippy/config.json` (`language: "en" | "zh-CN"`)
- **Tray menu simplification** — menu becomes: Settings (opens modal), About, Exit — all three labels are also translated

## Capabilities

### New Capabilities
- `i18n-locale`: Locale registry, translation dictionaries for en/zh-CN, and a `t()` lookup function
- `settings-modal`: Renderer-side settings modal with language selector and auto-start toggle, opened via tray or right-click

### Modified Capabilities

## Impact

- `packages/desktop/src/widget/renderer/renderer.ts` — import i18n, use `t()` for all user-facing strings, add settings modal open/close
- `packages/desktop/src/widget/renderer/event-mapping.ts` — tips become i18n keys instead of hardcoded strings
- `packages/desktop/src/widget/main/main.ts` — tray menu labels use i18n, handle settings IPC (get/set config), move auto-start logic to settings modal
- `packages/desktop/src/widget/preload/preload.ts` — expose settings IPC (getConfig, setConfig, openSettings)
- `packages/shared/src/tips-engine.ts` — tip text becomes i18n keys
- New file: `packages/desktop/src/widget/renderer/i18n.ts` — locale registry and `t()` function
- New file: `packages/desktop/src/widget/renderer/settings-modal.ts` — settings modal component
