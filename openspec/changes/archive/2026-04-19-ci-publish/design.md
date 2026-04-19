## Context

OpenCode Clippy is a two-component system: an Electron desktop widget and an OpenCode plugin (gateway). They communicate via Unix socket / named pipe IPC. Currently distributed only via git clone + manual build.

The project uses: Electron 33, TypeScript, Vite (renderer), electron-builder (packaging), and the `@opencode-ai/plugin` SDK.

## Goals / Non-Goals

**Goals:**
- One-command install for the plugin: `"plugin": ["opencode-clippy"]` in opencode.json
- Pre-built Electron binaries downloadable from GitHub Releases
- Fully automated: push a `v*.*.*` tag → builds run → artifacts published
- Builds on all 3 platforms (macOS arm64/x64, Windows x64, Linux x64)

**Non-Goals:**
- Auto-update mechanism for the Electron app (v2)
- Homebrew/Chocolatey/AUR package managers (v2)
- Monorepo tooling (pnpm workspaces, turborepo) — keep it simple

## Decisions

### 1. Single workflow file for both npm + Electron release

**Choice**: One `.github/workflows/release.yml` triggered by `v*.*.*` tags. Two jobs: `publish-npm` and `build-electron` (matrix: macOS, Windows, Linux).

**Why**: Simpler than two separate workflows. Both releases share the same version tag. The npm job is fast (just publish), the Electron job runs in parallel on 3 OS matrices.

### 2. Plugin as a standalone npm package

**Choice**: The plugin entry point is `.opencode/plugins/clippy.ts`. For npm, we publish a package called `opencode-clippy` that contains the plugin file with all dependencies inlined (no external imports except `@opencode-ai/plugin` and Node builtins).

**Why**: OpenCode loads plugins via `"plugin": ["opencode-clippy"]` in opencode.json. The npm package just needs to export the plugin function as default. The tips engine is already inlined in `clippy.ts`. The only dependency is `@opencode-ai/plugin` which OpenCode provides at runtime.

### 3. electron-builder with specific platform targets

**Choice**: Use electron-builder with GitHub Actions matrix strategy. Each runner builds for its native architecture to avoid cross-compilation issues:

| Runner | Target | Output |
|---|---|---|
| `macos-latest` (arm64) | macOS aarch64 | `.dmg` |
| `windows-latest` (x64) | Windows x86-64 | `.exe` (NSIS) |
| `ubuntu-latest` (x64) + QEMU | Linux aarch64 | `.AppImage`, `.deb` |

**Why**: macOS arm64 builds natively on `macos-latest` (Apple Silicon runners). Windows x64 builds natively. Linux aarch64 is the tricky one — GitHub doesn't offer arm64 Linux runners, so we use `docker/setup-qemu-action` + electron-builder's `--arm64` flag to cross-compile from the x64 runner. This is the standard approach used by most Electron projects.

**Alternatives considered**:
- **Build all on one runner with cross-compilation**: electron-builder supports `--mac --win --linux` on macOS, but Windows NSIS and Linux deb cross-builds are unreliable.
- **Self-hosted arm64 runners**: More reliable but requires infrastructure. Not worth it for an open-source project.

### 4. GitHub Releases for Electron binaries

**Choice**: Use `softprops/action-gh-release` to upload built binaries to the GitHub Release created by the tag.

**Why**: Standard approach. Users download from the Releases page. No package manager needed.

## Risks / Trade-offs

- **[macOS code signing]** Without an Apple Developer cert, DMGs will show "unidentified developer" warning → Acceptable for open-source project, document the workaround in README
- **[npm package name]** `opencode-clippy` may be taken → Check availability before publishing
- **[Large binaries]** Electron builds are 80-150MB each → GitHub Releases handles this fine, no size limit concerns
