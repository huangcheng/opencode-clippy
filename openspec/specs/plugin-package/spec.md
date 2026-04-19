## ADDED Requirements

### Requirement: Plugin is a valid npm package
The project SHALL have a `package.json` with `name: "opencode-clippy"`, proper `main` entry pointing to the plugin file, and `files` array including only the plugin and its dependencies.

#### Scenario: npm pack produces correct package
- **WHEN** `npm pack` is run
- **THEN** the tarball contains the plugin entry point and all required files

### Requirement: Plugin has no external runtime dependencies beyond Node builtins and @opencode-ai/plugin
The plugin file SHALL only import from Node.js built-in modules (`net`, `os`, `path`) and `@opencode-ai/plugin` (provided by OpenCode at runtime). The tips engine SHALL remain inlined.

#### Scenario: Plugin loads without npm install
- **WHEN** OpenCode loads the plugin via `"plugin": ["opencode-clippy"]`
- **THEN** it loads successfully using only Node builtins and the OpenCode-provided plugin SDK

### Requirement: Plugin package includes metadata
The `package.json` SHALL include `description`, `keywords`, `repository`, `license`, and `author` fields for npm discoverability.

#### Scenario: npm page shows correct metadata
- **WHEN** the package is published
- **THEN** the npm page shows description, keywords, repository link, and license
