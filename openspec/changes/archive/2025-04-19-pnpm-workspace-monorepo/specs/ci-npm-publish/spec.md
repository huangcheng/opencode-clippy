## MODIFIED Requirements

### Requirement: Plugin publishes to npm on version tags
The GitHub Actions workflow SHALL publish the `opencode-clippy` package from `packages/plugin` to npm when a `v*.*.*` tag is pushed.

#### Scenario: Tag push publishes to npm
- **WHEN** a tag `v1.0.0` is pushed
- **THEN** `pnpm publish --filter opencode-clippy --access public --no-git-checks` publishes version `1.0.0` to the npm registry

### Requirement: npm publish uses NPM_TOKEN secret
The workflow SHALL authenticate with npm using the `NPM_TOKEN` repository secret via `NODE_AUTH_TOKEN` environment variable.

#### Scenario: Authentication succeeds
- **WHEN** the publish job runs
- **THEN** it uses the `NPM_TOKEN` secret to authenticate with npm

### Requirement: Version synced from tag in plugin package
The workflow SHALL extract the version from the git tag (stripping the `v` prefix) and set it on `packages/plugin/package.json` before publishing.

#### Scenario: Version matches tag
- **WHEN** tag `v1.2.3` triggers the workflow
- **THEN** `packages/plugin/package.json` version is set to `1.2.3` via `pnpm version` before publish

### Requirement: CI uses pnpm instead of npm
The publish job SHALL use `pnpm/action-setup@v4` to install pnpm, `pnpm install --frozen-lockfile` for dependencies, and `pnpm publish` for publishing.

#### Scenario: pnpm-based publish flow
- **WHEN** the publish job runs
- **THEN** it uses pnpm for all package operations (install, version, publish)

### Requirement: Plugin build runs before publish
The workflow SHALL run `pnpm --filter opencode-clippy build` before `pnpm publish` to produce the compiled plugin output.

#### Scenario: Published plugin includes compiled output
- **WHEN** the plugin is published
- **THEN** the npm tarball contains the built plugin file with inlined shared code

### Requirement: publish-npm job has no dependency on Electron build
The `publish-npm` job SHALL run independently of the `build-electron` job and SHALL NOT install Electron dependencies.

#### Scenario: npm publish is lightweight
- **WHEN** the publish-npm job runs
- **THEN** it only installs dependencies needed for the plugin package, not the full desktop workspace
