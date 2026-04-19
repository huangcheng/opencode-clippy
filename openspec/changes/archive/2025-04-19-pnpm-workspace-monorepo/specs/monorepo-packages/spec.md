## ADDED Requirements

### Requirement: Plugin workspace package
The project SHALL contain a `packages/plugin` workspace package with `"name": "opencode-clippy"` that builds and publishes the OpenCode plugin to npm.

#### Scenario: Plugin package has correct npm metadata
- **WHEN** `packages/plugin/package.json` is inspected
- **THEN** it has `"name": "opencode-clippy"`, a `"main"` entry pointing to the built plugin output, and `"files"` listing only the plugin distribution files

### Requirement: Plugin build produces self-contained output
The plugin package SHALL have a build script that compiles TypeScript and inlines all workspace dependency code (from `@opencode-clippy/shared`) into a single output file with no external runtime dependencies.

#### Scenario: Plugin output is dependency-free
- **WHEN** the plugin build completes
- **THEN** the output file imports only Node.js built-in modules and `@opencode-ai/plugin`

### Requirement: Desktop workspace package
The project SHALL contain a `packages/desktop` workspace package with `"name": "@opencode-clippy/desktop"` that builds the Electron desktop application.

#### Scenario: Desktop package contains electron-builder config
- **WHEN** `packages/desktop/package.json` is inspected
- **THEN** it has a `"build"` section with electron-builder configuration (appId, targets, file patterns, extraResources)

### Requirement: Desktop package builds from widget sources
The desktop package SHALL compile the Electron main process, preload script, and Vite renderer from source files within its own directory structure.

#### Scenario: Desktop build produces all Electron outputs
- **WHEN** `pnpm --filter @opencode-clippy/desktop build` is run
- **THEN** it produces `dist/widget/main/main.js`, `dist/widget/preload/preload.js`, and `dist/widget/renderer/` bundle

### Requirement: Shared workspace package
The project SHALL contain a `packages/shared` workspace package with `"name": "@opencode-clippy/shared"` that exports shared logic (tips engine, event mapping types) used by both the plugin and desktop packages.

#### Scenario: Shared package exports tips engine
- **WHEN** `@opencode-clippy/shared` is imported
- **THEN** the TipsEngine class and related types are available

### Requirement: Shared package is private
The shared package SHALL have `"private": true` and SHALL NOT be published to npm.

#### Scenario: Shared package is not publishable
- **WHEN** `pnpm publish` is attempted on the shared package
- **THEN** it is skipped or fails because the package is private

### Requirement: Source files relocated to package directories
All source files SHALL be moved from the root-level `widget/`, `plugin/`, `.opencode/plugins/`, and `assets/` directories into their respective workspace package directories.

#### Scenario: No root-level source directories remain
- **WHEN** the migration is complete
- **THEN** `widget/`, `plugin/`, and `assets/` directories no longer exist at the project root

### Requirement: Each package has its own TypeScript config
Each workspace package SHALL contain its own `tsconfig.json` appropriate for its compilation target. The desktop package MAY have additional sub-configs for main/preload/renderer.

#### Scenario: TypeScript compiles per-package
- **WHEN** `pnpm --filter <package> build` is run
- **THEN** TypeScript uses the package's own `tsconfig.json` and outputs to the package's `dist/` directory
