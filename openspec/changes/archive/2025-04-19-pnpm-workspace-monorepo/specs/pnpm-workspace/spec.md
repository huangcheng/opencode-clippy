## ADDED Requirements

### Requirement: pnpm workspace configuration
The project root SHALL contain a `pnpm-workspace.yaml` file that declares `packages/*` as workspace packages.

#### Scenario: pnpm recognizes workspace packages
- **WHEN** `pnpm install` is run at the project root
- **THEN** pnpm discovers and links all workspace packages under `packages/`

### Requirement: Root package is private workspace orchestrator
The root `package.json` SHALL have `"private": true`, no `"main"` field, no `"files"` field, no `"build"` section, and shall declare workspace-level convenience scripts.

#### Scenario: Root package cannot be published
- **WHEN** `pnpm publish` is run at the root
- **THEN** it fails or is a no-op because the root is private

### Requirement: pnpm version pinned via packageManager field
The root `package.json` SHALL include a `"packageManager"` field specifying the pnpm version.

#### Scenario: Corepack activates correct pnpm version
- **WHEN** a developer runs `corepack enable` and `pnpm install`
- **THEN** the exact pinned pnpm version is used

### Requirement: Lockfile uses pnpm format
The project SHALL use `pnpm-lock.yaml` and SHALL NOT contain `package-lock.json`.

#### Scenario: Clean install produces deterministic lockfile
- **WHEN** `pnpm install` is run from a clean checkout
- **THEN** a `pnpm-lock.yaml` is generated and no `package-lock.json` exists

### Requirement: workspace protocol for internal dependencies
Workspace packages that depend on other workspace packages SHALL use the `workspace:*` protocol in their `package.json` dependencies.

#### Scenario: Shared package linked locally during development
- **WHEN** `packages/plugin` depends on `@opencode-clippy/shared` via `"workspace:*"`
- **THEN** pnpm symlinks the local shared package during development

### Requirement: node-linker set to hoisted for Electron compatibility
The project root SHALL contain a `.npmrc` file with `node-linker=hoisted` to ensure electron-builder can resolve dependencies correctly in the pnpm workspace.

#### Scenario: electron-builder resolves dependencies correctly
- **WHEN** `pnpm --filter @opencode-clippy/desktop package` is run
- **THEN** electron-builder successfully resolves all dependencies from the hoisted `node_modules`
