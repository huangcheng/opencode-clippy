import { app, BrowserWindow, screen, Tray, Menu, nativeImage } from "electron";
import * as net from "net";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

const WINDOW_WIDTH = 350;
const WINDOW_HEIGHT = 300;
const EDGE_OFFSET = 50;

// IPC path — Unix socket on macOS/Linux, named pipe on Windows
const IPC_PATH = process.platform === "win32"
  ? "\\\\.\\pipe\\opencode-clippy"
  : path.join(os.tmpdir(), "opencode-clippy.sock");

// Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  console.log("Another Clippy instance is already running. Exiting.");
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let ipcServer: net.Server | null = null;
let tray: Tray | null = null;

function getIconPath(): string {
  const candidates = [
    path.join(__dirname, "../../assets/icon.png"),
    path.join(__dirname, "../../../assets/icon.png"),
    path.join(process.resourcesPath || "", "assets/icon.png"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

function createTray(): void {
  let trayIcon: Electron.NativeImage;
  try {
    trayIcon = nativeImage.createFromPath(getIconPath()).resize({ width: 18, height: 18 });
  } catch {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip("OpenCode Clippy");
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: "Show/Hide Clippy",
      click: () => {
        if (mainWindow) mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      },
    },
    { type: "separator" },
    { label: `IPC: ${IPC_PATH}`, enabled: false },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]));
}

function createWindow(): void {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: screenWidth - WINDOW_WIDTH - EDGE_OFFSET,
    y: screenHeight - WINDOW_HEIGHT - EDGE_OFFSET,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.show();

  const rendererPath = path.join(__dirname, "../renderer/index.html");
  console.log("Loading renderer from:", rendererPath);
  mainWindow.loadFile(rendererPath);

  mainWindow.webContents.on("did-finish-load", () => console.log("Renderer loaded successfully"));
  mainWindow.webContents.on("did-fail-load", (_e, code, desc) => console.error("Renderer failed:", code, desc));
  mainWindow.webContents.on("console-message", (_e, _l, msg) => console.log("[renderer]", msg));
  mainWindow.on("closed", () => { mainWindow = null; });
}

function startIPCServer(): void {
  // Clean up stale socket file on macOS/Linux
  if (process.platform !== "win32") {
    try { fs.unlinkSync(IPC_PATH); } catch { /* doesn't exist */ }
  }

  ipcServer = net.createServer((socket) => {
    console.log("Plugin connected via IPC");
    let buffer = "";
    let lastPing = Date.now();

    // Heartbeat check — close stale connections
    const heartbeatCheck = setInterval(() => {
      if (Date.now() - lastPing > 15000) {
        console.log("Plugin heartbeat timeout, closing connection");
        clearInterval(heartbeatCheck);
        socket.destroy();
      }
    }, 5000);

    socket.on("data", (data) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.type === "ping") {
            lastPing = Date.now();
            continue;
          }

          console.log("Forwarding to renderer:", msg.type, msg.event || "");
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("clippy-event", msg);
          }
        } catch {
          // ignore malformed
        }
      }
    });

    socket.on("close", () => {
      clearInterval(heartbeatCheck);
      console.log("Plugin disconnected");
    });
    socket.on("error", (err) => {
      clearInterval(heartbeatCheck);
      console.log("Socket error:", err.message);
    });
  });

  ipcServer.listen(IPC_PATH, () => {
    console.log(`Clippy IPC server listening on ${IPC_PATH}`);
  });

  ipcServer.on("error", (err) => {
    console.error("IPC server error:", err.message);
  });
}

app.on("second-instance", () => {
  if (mainWindow && !mainWindow.isVisible()) mainWindow.show();
});

app.whenReady().then(() => {
  createWindow();
  createTray();
  startIPCServer();
});

app.on("window-all-closed", () => { /* keep running in tray */ });

app.on("will-quit", () => {
  if (ipcServer) ipcServer.close();
  if (tray) tray.destroy();
  // Clean up socket file
  if (process.platform !== "win32") {
    try { fs.unlinkSync(IPC_PATH); } catch { /* ok */ }
  }
});
