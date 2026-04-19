## MODIFIED Requirements

### Requirement: Plugin is a valid npm package
`packages/plugin/package.json` SHALL have `"name": "opencode-clippy"`, a `"main"` entry pointing to the built plugin output, and `"files"` array including only the plugin distribution files.

#### Scenario: npm pack produces correct package
- **WHEN** `pnpm pack` is run in `packages/plugin`
- **THEN** the tarball contains the plugin entry point and all required files, with no Electron or desktop-related files

### Requirement: Plugin has no external runtime dependencies beyond Node builtins and @opencode-ai/plugin
The built plugin file SHALL only import from Node.js built-in modules (`net`, `os`, `path`) and `@opencode-ai/plugin` (provided by OpenCode at runtime). The tips engine code from `@opencode-clippy/shared` SHALL be inlined at build time.

#### Scenario: Plugin loads without npm install
- **WHEN** OpenCode loads the plugin via `"plugin": ["opencode-clippy"]`
- **THEN** it loads successfully using only Node builtins and the OpenCode-provided plugin SDK

### Requirement: Plugin package includes metadata
`packages/plugin/package.json` SHALL include `description`, `keywords`, `repository`, `license`, and `author` fields for npm discoverability.

#### Scenario: npm page shows correct metadata
- **WHEN** the package is published
- **THEN** the npm page shows description, keywords, repository link, and license

### Requirement: Plugin depends on shared via workspace protocol
`packages/plugin/package.json` SHALL declare `"@opencode-clippy/shared": "workspace:*"` as a dev dependency. This dependency SHALL NOT appear in the published npm package.

#### Scenario: Published package has no workspace references
- **WHEN** `pnpm publish` runs on the plugin package
- **THEN** the published `package.json` has no `workspace:*` references (pnpm strips them automatically)
