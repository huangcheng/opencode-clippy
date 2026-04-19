## Implementation Tasks

### Phase 1: Scaffold workspace structure

- [x] **T0: Create .npmrc with node-linker=hoisted** — Add `.npmrc` containing `node-linker=hoisted` at project root (required for electron-builder compatibility with pnpm)
- [x] **T1: Create pnpm-workspace.yaml** — Add `pnpm-workspace.yaml` with `packages: ['packages/*']` at project root
- [x] **T2: Convert root package.json to workspace root** — Set `"private": true`, remove `"main"`, `"files"`, `"build"` section, add `"packageManager": "pnpm@10.x"`, add workspace-level scripts (`build`, `build:plugin`, `build:desktop`, `package`, `dev`)
- [x] **T3: Create package directories** — `mkdir -p packages/{plugin,desktop,shared}/src`
- [x] **T4: Initialize packages/plugin/package.json** — `"name": "opencode-clippy"`, `"main": "dist/clippy.js"`, `"files": ["dist"]`, devDep on `@opencode-clippy/shared` via `workspace:*`, build script with TypeScript compilation + inline
- [x] **T5: Initialize packages/desktop/package.json** — `"name": "@opencode-clippy/desktop"`, `"private": true`, move all Electron deps from root, move `build` section (electron-builder config), devDep on `@opencode-clippy/shared` via `workspace:*`
- [x] **T6: Initialize packages/shared/package.json** — `"name": "@opencode-clippy/shared"`, `"private": true`, `"main": "dist/index.js"`, `"types": "dist/index.d.ts"`, build script with `tsc`

### Phase 2: Relocate source files

- [x] **T7: Move plugin source** — Move `.opencode/plugins/clippy.ts` → `packages/plugin/src/clippy.ts`, update imports to use `@opencode-clippy/shared` instead of inlined TipsEngine
- [x] **T8: Move tips engine to shared** — Move `plugin/tips-engine.ts` → `packages/shared/src/tips-engine.ts`, create `packages/shared/src/index.ts` barrel export
- [x] **T9: Move widget sources to desktop** — Move `widget/` directory contents → `packages/desktop/src/widget/` (or `packages/desktop/src/` directly)
- [x] **T10: Move assets to desktop** — Move `assets/` → `packages/desktop/assets/`
- [x] **T11: Move Vite config to desktop** — Move `vite.config.ts` → `packages/desktop/vite.config.ts`
- [x] **T12: Delete empty root directories** — Remove `widget/`, `plugin/`, `assets/`, `.opencode/plugins/` from root after move confirmed

### Phase 3: TypeScript configuration

- [x] **T13: Create packages/shared/tsconfig.json** — `"outDir": "dist"`, include `src/`, target ES2022, module NodeNext
- [x] **T14: Create packages/plugin/tsconfig.json** — `"outDir": "dist"`, include `src/`, target ES2022, module NodeNext, references `@opencode-clippy/shared`
- [x] **T15: Create desktop TypeScript configs** — `packages/desktop/tsconfig.json` (base), `packages/desktop/tsconfig.main.json` (main process), `packages/desktop/tsconfig.preload.json` (preload), update paths from `widget/` to `src/`
- [x] **T16: Delete root tsconfig files** — Remove `tsconfig.json`, `tsconfig.main.json`, `tsconfig.preload.json` from root

### Phase 4: Dependency migration

- [x] **T17: Split root dependencies** — Plugin-only deps → `packages/plugin/package.json`, Electron deps → `packages/desktop/package.json`, shared-only deps → `packages/shared/package.json`, dev deps shared across packages → root `package.json`
- [x] **T18: Delete root package-lock.json** — Remove npm lockfile
- [x] **T19: Run pnpm install** — Generate `pnpm-lock.yaml`, verify workspace linking works
- [x] **T20: Verify builds** — `pnpm --filter @opencode-clippy/shared build`, `pnpm --filter opencode-clippy build`, `pnpm --filter @opencode-clippy/desktop build`

### Phase 5: CI/CD migration

- [x] **T21: Add pnpm setup to publish-npm job** — Replace `npm` commands with `pnpm/action-setup@v4`, `pnpm install --frozen-lockfile`, `pnpm --filter opencode-clippy build`, `pnpm --filter opencode-clippy publish`
- [x] **T22: Add pnpm setup to build-electron job** — Replace `npm install` with `pnpm install --frozen-lockfile`, `npm run build` with `pnpm --filter @opencode-clippy/desktop build`, `npx electron-builder` with `pnpm --filter @opencode-clippy/desktop package`
- [x] **T23: Update version-setting commands** — Change `npm version` to `pnpm version` or manual `jq` edits targeting `packages/plugin/package.json` and `packages/desktop/package.json`
- [x] **T24: Verify CI workflow syntax** — Ensure all paths, working directories, and package filters are correct

### Phase 6: Cleanup

- [x] **T25: Delete .npmignore** — No longer needed (plugin package uses `files` field in its own `package.json`)
- [x] **T26: Update README** — Update development instructions to use `pnpm install`, `pnpm build`, `pnpm dev`
- [x] **T27: Update .gitignore** — Add `pnpm-lock.yaml` if not already tracked, remove any npm-specific entries
- [x] **T28: Final verification** — `pnpm install && pnpm build` from clean checkout, verify plugin output is self-contained, verify desktop build produces Electron binaries
