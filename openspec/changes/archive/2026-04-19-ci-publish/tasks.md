## 1. Plugin npm Package Setup

- [x] 1.1 Update `package.json`: set `name` to `opencode-clippy`, add `description`, `keywords`, `repository`, `license`, `author`, and `files` array pointing to the plugin entry point
- [x] 1.2 Create a top-level plugin entry point (e.g., `index.ts`) that re-exports from `.opencode/plugins/clippy.ts`, or configure `main` to point directly to the plugin file
- [x] 1.3 Verify `npm pack` produces a correct tarball with only the plugin files (no Electron widget, no assets)
- [x] 1.4 Add `.npmignore` to exclude `widget/`, `assets/`, `dist/`, `openspec/`, `.github/`, etc.

## 2. GitHub Actions — Release Workflow

- [x] 2.1 Create `.github/workflows/release.yml` triggered on `push: tags: ['v*.*.*']`
- [x] 2.2 Add `publish-npm` job: checkout, setup Node, extract version from tag, update `package.json` version, run `npm publish` with `NPM_TOKEN` secret
- [x] 2.3 Add `build-electron` job with matrix: `{os: macos-latest, target: mac-arm64}`, `{os: windows-latest, target: win-x64}`, `{os: ubuntu-latest, target: linux-arm64}`
- [x] 2.4 In each matrix job: checkout, setup Node, `npm install`, `npm run build`, run `electron-builder` with correct `--arm64` or `--x64` flags
- [x] 2.5 For Linux arm64: add `docker/setup-qemu-action` step before electron-builder to enable aarch64 cross-compilation
- [x] 2.6 Upload built binaries (`.dmg` arm64, `.exe` x64, `.AppImage` arm64, `.deb` arm64) as artifacts
- [x] 2.7 Add `create-release` job (needs: build-electron): download all artifacts, create GitHub Release with auto-generated notes, upload all binaries using `softprops/action-gh-release`

## 3. Package.json & Build Config

- [x] 3.1 Update `electron-builder` config in `package.json`: mac target `dmg` arch `arm64`, win target `nsis` arch `x64`, linux targets `AppImage`+`deb` arch `arm64`, include version in filenames
- [x] 3.2 Add `"publish": null` to electron-builder config to prevent auto-publish (we handle it in CI)
- [x] 3.3 Verify `npm run package:mac`, `npm run package:win`, `npm run package:linux` work locally

## 4. Documentation & Testing

- [x] 4.1 Update README installation section: add `"plugin": ["opencode-clippy"]` as the primary install method
- [x] 4.2 Add download links section to README pointing to GitHub Releases
- [x] 4.3 Test the full flow: create a test tag, verify workflow runs, check npm publish (dry-run), check GitHub Release artifacts
