## MODIFIED Requirements

### Requirement: Electron builds trigger on version tags
The GitHub Actions workflow SHALL trigger on push of tags matching `v*.*.*`.

#### Scenario: Tag push triggers build
- **WHEN** a tag `v1.0.0` is pushed to the repository
- **THEN** the Electron build job starts on macOS, Windows, and Linux runners

### Requirement: Build matrix covers specific platform targets
The workflow SHALL build Electron binaries for exactly these targets:
- **macOS aarch64** (Apple Silicon) on `macos-latest`
- **Windows x86-64** on `windows-latest`
- **Linux aarch64** on `ubuntu-latest` using QEMU cross-compilation

#### Scenario: All platform artifacts are produced
- **WHEN** the build matrix completes
- **THEN** the following artifacts exist: `.dmg` (macOS arm64), `.exe` (Windows x64), `.AppImage` (Linux arm64), and `.deb` (Linux arm64)

### Requirement: Binaries uploaded to GitHub Release
The workflow SHALL upload all built binaries to the GitHub Release associated with the triggering tag.

#### Scenario: Release contains downloadable binaries
- **WHEN** all build jobs complete
- **THEN** the GitHub Release for the tag contains downloadable `.dmg`, `.exe`, `.AppImage`, and `.deb` files

### Requirement: Release notes auto-generated
The workflow SHALL auto-generate release notes from commit history since the previous tag.

#### Scenario: Release has notes
- **WHEN** the release is created
- **THEN** it contains auto-generated notes listing commits since the last release

### Requirement: CI uses pnpm for Electron builds
The build-electron job SHALL use `pnpm/action-setup@v4` to install pnpm, `pnpm install --frozen-lockfile` for dependencies, and `pnpm --filter @opencode-clippy/desktop` for targeted build and package commands.

#### Scenario: pnpm-based Electron build flow
- **WHEN** the build-electron job runs
- **THEN** it uses `pnpm install --frozen-lockfile` and `pnpm --filter @opencode-clippy/desktop build` to build the desktop app

### Requirement: Version set on desktop package
The workflow SHALL set the version from the git tag on `packages/desktop/package.json` before packaging.

#### Scenario: Electron binary version matches tag
- **WHEN** tag `v1.2.3` triggers the workflow
- **THEN** `packages/desktop/package.json` version is set to `1.2.3` so the built binary reports the correct version

### Requirement: electron-builder runs from desktop package context
The workflow SHALL run `electron-builder` from within the `packages/desktop` directory or use `pnpm --filter @opencode-clippy/desktop package` so that electron-builder reads the correct `package.json` build section.

#### Scenario: electron-builder finds correct config
- **WHEN** electron-builder runs
- **THEN** it reads the `build` section from `packages/desktop/package.json` (not root)
