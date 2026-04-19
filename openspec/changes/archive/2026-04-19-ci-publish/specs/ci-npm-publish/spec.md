## ADDED Requirements

### Requirement: Plugin publishes to npm on version tags
The GitHub Actions workflow SHALL publish the `opencode-clippy` package to npm when a `v*.*.*` tag is pushed.

#### Scenario: Tag push publishes to npm
- **WHEN** a tag `v1.0.0` is pushed
- **THEN** the `opencode-clippy` package at version `1.0.0` is published to the npm registry

### Requirement: npm publish uses NPM_TOKEN secret
The workflow SHALL authenticate with npm using the `NPM_TOKEN` repository secret.

#### Scenario: Authentication succeeds
- **WHEN** the publish job runs
- **THEN** it uses the `NPM_TOKEN` secret to authenticate with npm

### Requirement: Version synced from tag
The workflow SHALL extract the version from the git tag (stripping the `v` prefix) and ensure `package.json` version matches before publishing.

#### Scenario: Version matches tag
- **WHEN** tag `v1.2.3` triggers the workflow
- **THEN** `package.json` version is set to `1.2.3` before `npm publish`
