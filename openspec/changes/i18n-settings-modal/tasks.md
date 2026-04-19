## 1. i18n Module

- [x] 1.1 Create `packages/desktop/src/widget/renderer/i18n.ts` with en and zh-CN dictionaries, `t()`, `setLocale()`, `getLocale()`, and `onLocaleChange` callback
- [x] 1.2 Add all translation keys: event mapping tips, click/dblclick reactions, greeting, speech bubble texts, settings labels, tray menu labels

## 2. Convert Hardcoded Strings to i18n Keys

- [x] 2.1 Update `event-mapping.ts` — replace tip strings with i18n keys (e.g., `"tip.working"`)
- [x] 2.2 Update `renderer.ts` — use `t()` for click reactions, dblclick reactions, greeting text
- [x] 2.3 Update `renderer.ts` — wrap speech bubble `mapping.tip` with `t()` before displaying
- [x] 2.4 Update tips engine tip texts in `shared/src/tips-engine.ts` to use i18n keys

## 3. Settings IPC

- [x] 3.1 Add `getConfig`, `setConfig`, and `onSettingsOpen` to `preload.ts` context bridge
- [x] 3.2 Add `ipcMain.handle("get-config")` and `ipcMain.handle("set-config")` in `main.ts`
- [x] 3.3 Send `"open-settings"` event from tray "Settings" click to renderer via webContents

## 4. Settings Modal

- [x] 4.1 Create `packages/desktop/src/widget/renderer/settings-modal.ts` with Windows 98-style modal overlay
- [x] 4.2 Add language dropdown (English / 简体中文) that calls `setConfig({ language })` and `setLocale()`
- [x] 4.3 Add "Launch at Login" checkbox that calls `setConfig({ autoStart })` and applies login item
- [x] 4.4 Add close button and click-outside-to-dismiss behavior
- [x] 4.5 Wire up settings modal open from `onSettingsOpen` callback in `renderer.ts`

## 5. Tray Menu Update

- [x] 5.1 Remove "Launch at Login" checkbox from tray menu
- [x] 5.2 Add inline label map for tray menu (en/zh-CN) in `main.ts`, rebuild menu on config language change
- [x] 5.3 Rebuild tray menu when `set-config` receives a language change

## 6. Build & Test

- [x] 6.1 Build full workspace and verify no TypeScript errors
- [x] 6.2 Manual test: settings modal opens, language switch works, auto-start toggle works
- [x] 6.3 Manual test: speech bubbles and tips display in Chinese after switching
- [x] 6.4 Manual test: tray menu labels update to Chinese
- [x] 6.5 Manual test: config.json persists language and autoStart, survives restart
