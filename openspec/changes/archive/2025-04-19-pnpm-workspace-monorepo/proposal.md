## Why

The project currently ships two distinct artifacts (an npm plugin package and an Electron desktop app) from a single package.json with conflicting concerns — `"main"` points to the Electron entry but `"files"` only includes the plugin file, `.npmignore` must carefully exclude everything except the plugin, and the CI workflow runs `npm install` for both the lightweight plugin publish and the heavy Electron build. Converting to a pnpm workspace monorepo cleanly separates these concerns, enables independent versioning, eliminates the `.npmignore` hack, and provides a scalable foundation for future packages.

## What Changes

- **BREAKING**: Root `package.json` becomes a workspace root (private, no publish). All current npm/Electron metadata moves to workspace packages.
- Replace `package-lock.json` with `pnpm-lock.yaml` and add `pnpm-workspace.yaml`
- Create three workspace packages under `packages/`:
  - `packages/plugin` — the OpenCode plugin (`@opencode-clippy/plugin`), published to npm
  - `packages/desktop` — the Electron desktop app (`@opencode-clippy/desktop`), distributed via GitHub Releases
  - `packages/shared` — shared logic (tips engine, event mapping, types) used by both
- Move `widget/`, `assets/`, `vite.config.ts`, and `tsconfig.*.json` (main/preload) into `packages/desktop/`
- Move `.opencode/plugins/clippy.ts` into `packages/plugin/src/` as the plugin entry point
- Move `plugin/tips-engine.ts` into `packages/shared/src/`
- Update `.github/workflows/release.yml` to use `pnpm install --frozen-lockfile` and `pnpm --filter` for targeted builds/publishes
- Delete `.npmignore` (no longer needed — each package has its own `files` field)
- Delete `package-lock.json`
- Update `README.md` development instructions to use `pnpm`

## Capabilities

### New Capabilities
- `pnpm-workspace`: Workspace configuration, pnpm-workspace.yaml, shared TypeScript configs, and dependency hoisting rules
- `monorepo-packages`: The three workspace packages (plugin, desktop, shared) with their own package.json, build scripts, and file boundaries

### Modified Capabilities
- `ci-npm-publish`: Workflow must use `pnpm --filter @opencode-clippy/plugin publish` instead of root-level `npm publish`
- `ci-electron-release`: Workflow must use `pnpm --filter @opencode-clippy/desktop build/package` instead of root-level `npm run build`
- `plugin-package`: Plugin becomes `@opencode-clippy/plugin` with its own `package.json`; the root package name `opencode-clippy` is preserved as the npm package name for backward compatibility

## Impact

- **File moves**: Nearly all source files relocate to `packages/<name>/` subdirectories
- **CI/CD**: `.github/workflows/release.yml` rewritten for pnpm workspace commands
- **Developer workflow**: Switch from `npm install` to `pnpm install`; scripts change to `pnpm --filter` or workspace-level shortcuts
- **Dependencies**: `package-lock.json` → `pnpm-lock.yaml`; dev dependencies split between workspace packages
- **npm package name**: `opencode-clippy` remains the published npm name (backward compatible) via the plugin package's `package.json` `"name"` field
- **Build artifacts**: No change to output formats (`.dmg`, `.exe`, `.AppImage`, `.deb`)
