## Context

opencode-clippy is currently a single-package project that produces two distinct artifacts from one `package.json`:
1. **npm plugin package** (`opencode-clippy`) — a single TypeScript file (`.opencode/plugins/clippy.ts`) published to npm, used by OpenCode to hook coding events
2. **Electron desktop app** — a cross-platform widget (macOS, Windows, Linux) built with electron-builder, distributed via GitHub Releases

This dual-purpose root `package.json` creates friction:
- `"main"` points to the Electron entry (`dist/widget/main/main.js`) but `"files"` only includes the plugin — a contradictory setup
- `.npmignore` must carefully exclude everything except the plugin file
- CI runs `npm install` at root for both the lightweight plugin publish (which needs no deps) and the heavy Electron build (which needs electron + vite + typescript)
- Adding new packages (e.g., a shared core library) would require more `.npmignore` hacks

The project uses: TypeScript (tsc for main/preload, Vite for renderer), electron-builder (config inline in package.json), and GitHub Actions CI/CD.

## Goals / Non-Goals

**Goals:**
- Separate the npm plugin and Electron desktop app into independent workspace packages with their own `package.json`, dependencies, and build pipelines
- Extract shared logic (tips engine) into a third workspace package that both plugin and desktop can import
- Replace npm with pnpm as the package manager, using `pnpm-workspace.yaml`
- Update CI/CD to use `pnpm install --frozen-lockfile` and `pnpm --filter` for targeted builds
- Preserve backward compatibility: the npm package name `opencode-clippy` must remain unchanged so existing users don't break
- All existing CI/CD capabilities (npm publish on tags, Electron builds, GitHub Releases) continue to work identically

**Non-Goals:**
- Independent versioning per package (all packages share one version via the tag)
- Publishing `@opencode-clippy/shared` or `@opencode-clippy/desktop` to npm (these remain private)
- Changing the Electron build targets (still macOS arm64, Windows x64, Linux arm64)
- Adding new features or changing existing behavior
- Setting up changesets or automated versioning

## Decisions

### D1: Three workspace packages under `packages/`

**Decision**: Create `packages/plugin`, `packages/desktop`, and `packages/shared`.

**Rationale**: The plugin and desktop app have completely different dependency profiles — the plugin needs zero runtime deps (only `@opencode-ai/plugin` provided by OpenCode at runtime), while the desktop app depends on `electron`, `electron-builder`, `vite`, `lottie-web`, `ws`, etc. The tips engine is duplicated between `.opencode/plugins/clippy.ts` (inlined for npm distribution) and `plugin/tips-engine.ts` — extracting it into a shared package eliminates this duplication.

**Alternatives considered**:
- Two packages (plugin + desktop, no shared) — keeps the tips-engine duplication, not worth the trouble
- Four packages (plugin, desktop, shared, renderer) — over-engineering; renderer is an implementation detail of desktop, not a separate concern

### D2: Plugin package keeps the npm name `opencode-clippy`

**Decision**: `packages/plugin/package.json` uses `"name": "opencode-clippy"` (not `@opencode-clippy/plugin`).

**Rationale**: Existing users have `"opencode-clippy"` in their `opencode.json` plugin config. Changing the npm name would break all existing installations with no migration path.

### D3: Shared package uses workspace protocol

**Decision**: Both `packages/plugin` and `packages/desktop` depend on `@opencode-clippy/shared` via `"workspace:*"` protocol.

**Rationale**: pnpm workspace protocol ensures local linking during development and gets replaced by the actual version during publish. This keeps the monorepo tight.

### D4: Plugin inlines shared at build time

**Decision**: The plugin build step compiles `@opencode-clippy/shared` imports into the output, producing a single-file plugin with no external dependencies (matching the existing `plugin-package` spec requirement).

**Rationale**: The existing spec requires the plugin to have no external runtime dependencies beyond Node builtins and `@opencode-ai/plugin`. The plugin must remain self-contained after build.

### D5: Root `package.json` is a private workspace root

**Decision**: Root `package.json` becomes `"private": true` with `"workspaces` managed by pnpm. It has no `"main"`, no `"files"`, no `"build"` config. Workspace-level scripts use `pnpm --filter` shortcuts.

**Rationale**: Clean separation of concerns — root only orchestrates, packages do the work.

### D6: electron-builder config stays in `packages/desktop/package.json`

**Decision**: The `build` section moves from root `package.json` into `packages/desktop/package.json`.

**Rationale**: electron-builder reads the `build` key from the nearest `package.json`. In a monorepo, this must be the desktop package's `package.json`, not the root.

### D7: TypeScript configs remain per-package

**Decision**: Each workspace package gets its own `tsconfig.json` (inheriting from a shared base if needed). The root `tsconfig.json` is deleted.

**Rationale**: The current project already has 3 separate tsconfigs (base, main, preload). In a monorepo, each package manages its own TypeScript compilation. The desktop package will have sub-configs for main/preload/renderer.

### D8: pnpm version pinned via `packageManager` field

**Decision**: Add `"packageManager": "pnpm@10.x"` to root `package.json` and use `pnpm/action-setup` in CI.

**Rationale**: Ensures consistent pnpm version across developer machines and CI. Corepack support via the `packageManager` field.

## Risks / Trade-offs

- **[Risk] Breaking change for contributors** → All developers must install pnpm. Mitigation: Document in README, add `npx pnpm install` as fallback.
- **[Risk] Plugin build complexity increases** → Plugin now needs a build step to inline shared code. Mitigation: Simple `tsup` or `tsc` build that bundles everything into one file.
- **[Risk] CI workflow rewrite may break existing release flow** → Mitigation: Test the new workflow on a `v0.2.0-alpha` tag before cutting a real release.
- **[Risk] Large file move diff makes git history harder to follow** → Mitigation: Use `git log --follow` for individual files; the move is a one-time cost.
- **[Trade-off]** Lockfile changes from `package-lock.json` to `pnpm-lock.yaml` — all existing `package-lock.json` state is lost, but pnpm's lockfile is more deterministic.
- **[Trade-off]** The shared package adds indirection for what was previously inlined code. Simpler conceptually but more files to maintain.
