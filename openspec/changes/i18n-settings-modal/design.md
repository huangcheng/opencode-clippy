## Context

All user-facing strings in the Clippy widget are hardcoded English. The tray menu has a "Launch at Login" checkbox but no room for more settings. We need an i18n system and a settings modal to house language selection and auto-start.

The widget is an Electron app with a transparent frameless BrowserWindow. The renderer builds UI with DOM APIs (no framework). Settings are persisted in `~/.opencode-clippy/config.json`.

## Goals / Non-Goals

**Goals:**
- i18n system with `en` and `zh-CN` locales and a `t(key)` lookup function
- Settings modal in the renderer with language dropdown and auto-start checkbox
- Move "Launch at Login" from tray menu into the settings modal
- Translate tray menu labels, speech bubble tips, click reactions, event mapping tips
- Runtime locale switching without restart

**Non-Goals:**
- Locale auto-detection from OS settings
- Right-to-left (RTL) language support
- Plugin-side i18n (plugin tips engine stays English keys, translated in renderer)

## Decisions

### 1. i18n as a single `i18n.ts` module in the renderer

A flat key-value dictionary per locale. The `t(key)` function looks up the current locale dict, falls back to `en`. A `setLocale(lang)` function switches the active dict and fires a callback for tray menu rebuild.

```ts
// i18n.ts
const locales = { en: { ... }, "zh-CN": { ... } };
let current = "en";
export function t(key: string): string { return locales[current]?.[key] ?? locales.en[key] ?? key; }
export function setLocale(lang: string) { current = lang; onLocaleChange?.(); }
```

**Rationale**: Simplest approach — no dependencies, no framework, matches the project's vanilla DOM style.

### 2. Event mapping tips become i18n keys

`event-mapping.ts` returns keys like `"tip.working"` instead of `"Working on it..."`. The renderer calls `t(mapping.tip)` before showing the speech bubble. Click/double-click reaction tips in `renderer.ts` also become keys.

**Rationale**: Keeps translation centralized in one dictionary. Event mapping stays a pure data layer.

### 3. Settings modal as a DOM overlay in the renderer

The settings modal is built with DOM APIs in a new `settings-modal.ts` file. It overlays on top of the Clippy container with a semi-transparent backdrop. Styled to match the Windows 98 tooltip aesthetic (yellow background, black border, Tahoma font).

**Rationale**: Consistent with how speech bubbles are built. No need for a separate Electron window.

### 4. Settings IPC via preload bridge

New preload APIs:
- `getConfig()` → returns current config from main
- `setConfig(partial)` → merges partial config into main, saves to disk
- `onSettingsOpen(callback)` → listens for tray "Settings" click

Main process handles:
- `ipcMain.handle("get-config")` → reads and returns config
- `ipcMain.handle("set-config", partial)` → merges, saves, applies (login item, tray rebuild)
- Tray "Settings" click → sends `"open-settings"` to renderer via webContents

**Rationale**: Clean separation. Renderer never touches filesystem directly.

### 5. Tray menu rebuilt on locale change

When `setConfig({ language })` is called, main process rebuilds the tray context menu with translated labels. The `rebuildTrayMenu()` function already exists — it just needs to call `t()` for labels.

**Alternative considered**: Separate i18n module in main process. Rejected — simpler to pass translated labels from renderer via IPC, but even simpler: duplicate a minimal label map in main. Since there are only 3 labels (Settings, About, Exit), a small inline map in main is fine.

## Risks / Trade-offs

- **[i18n key typos]** → TypeScript won't catch missing keys since they're string lookups. Mitigated by keeping all keys in one file and reviewing coverage.
- **[Tray menu doesn't update live on macOS]** → `setContextMenu()` replaces the menu entirely, which works. No risk here.
- **[Settings modal z-index conflicts with speech bubble]** → Modal uses z-index 200, speech bubble uses 100. Modal backdrop covers everything.
