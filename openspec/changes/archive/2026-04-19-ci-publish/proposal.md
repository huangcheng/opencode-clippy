## Why

The project currently has no CI/CD pipeline. Users must clone the repo and build locally. To grow adoption, we need:
- The OpenCode plugin published to **npm** so users can install it with one line in their `opencode.json`
- The Electron desktop app published as **GitHub Releases** with pre-built binaries (`.dmg` for macOS, `.exe`/NSIS for Windows, `.AppImage`/`.deb` for Linux)
- Automated builds triggered by **git tags** (`v*.*.*`) so releasing is just `git tag v1.0.0 && git push --tags`

## What Changes

- Add GitHub Actions workflow for building and publishing the Electron app as GitHub Release assets (macOS, Windows, Linux)
- Add GitHub Actions workflow for publishing the OpenCode plugin to npm
- Restructure the plugin as a publishable npm package with its own `package.json`
- Add version bumping and changelog generation to the release flow
- Update README with simplified installation instructions (`"plugin": ["opencode-clippy"]` in opencode.json)

## Capabilities

### New Capabilities
- `ci-electron-release`: GitHub Actions workflow to build Electron app on macOS/Windows/Linux and upload binaries to GitHub Releases on tag push
- `ci-npm-publish`: GitHub Actions workflow to publish the OpenCode plugin to npm on tag push
- `plugin-package`: Restructure the plugin as a standalone npm package with proper entry point, dependencies, and metadata

### Modified Capabilities

## Impact

- **New files**: `.github/workflows/release.yml`, `.github/workflows/npm-publish.yml`
- **Modified**: `package.json` (add version field, ensure electron-builder config is correct)
- **New**: plugin npm package structure (either as monorepo workspace or separate package.json)
- **Secrets required**: `NPM_TOKEN` in GitHub repo secrets for npm publishing
- **No code changes**: only build/release infrastructure
