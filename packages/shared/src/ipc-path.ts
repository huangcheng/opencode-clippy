import * as os from "os";
import * as path from "path";

/**
 * Returns the IPC socket/pipe path shared by the plugin and the desktop widget.
 *
 * - Windows: named pipe `\\.\pipe\opencode-clippy`
 * - macOS / Linux: `~/.opencode-clippy/clippy.sock`
 *
 * Using a fixed path under $HOME avoids the macOS problem where `os.tmpdir()`
 * returns different session-specific paths for terminal processes vs .app bundles.
 */
export function getIPCPath(): string {
  if (process.platform === "win32") {
    return "\\\\.\\pipe\\opencode-clippy";
  }
  return path.join(os.homedir(), ".opencode-clippy", "clippy.sock");
}
