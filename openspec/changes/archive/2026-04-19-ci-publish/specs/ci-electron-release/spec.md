## ADDED Requirements

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
