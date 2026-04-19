import { app, BrowserWindow, screen, Tray, Menu, nativeImage, ipcMain } from "electron";
import * as net from "net";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { getIPCPath } from "@opencode-clippy/shared";

const WINDOW_WIDTH = 350;
const WINDOW_HEIGHT = 300;
const EDGE_OFFSET = 50;

// IPC path — Unix socket on macOS/Linux, named pipe on Windows
const IPC_PATH = getIPCPath();

// Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  console.log("Another Clippy instance is already running. Exiting.");
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let ipcServer: net.Server | null = null;
let tray: Tray | null = null;

// --- Config persistence ---
const CONFIG_DIR = path.join(os.homedir(), ".opencode-clippy");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

interface ClippyConfig {
  window?: { x: number; y: number };
}

function loadConfig(): ClippyConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function saveConfig(config: ClippyConfig): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch (e) {
      console.warn("Failed to save config:", e);
    }
  }, 500);
}

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
      label: "Settings",
      click: () => {
        if (mainWindow) mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      },
    },
    {
      label: "About",
      click: () => {
        const { dialog } = require("electron");
        dialog.showMessageBox({
          type: "info",
          title: "About OpenCode Clippy",
          message: "OpenCode Clippy",
          detail: `Version ${app.getVersion()}\nA Clippy-style assistant for OpenCode\n\n© HUANG Cheng\nhttps://github.com/huangcheng/opencode-clippy`,
        });
      },
    },
    { type: "separator" },
    { label: "Exit", click: () => app.quit() },
  ]));
}

function createWindow(): void {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const config = loadConfig();
  const startX = config.window?.x ?? (screenWidth - WINDOW_WIDTH - EDGE_OFFSET);
  const startY = config.window?.y ?? (screenHeight - WINDOW_HEIGHT - EDGE_OFFSET);

  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: startX,
    y: startY,
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
  // Ensure the socket directory exists on macOS/Linux
  if (process.platform !== "win32") {
    const dir = path.dirname(IPC_PATH);
    fs.mkdirSync(dir, { recursive: true });
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

// --- Drag IPC handlers ---
let dragOffset: { x: number; y: number } | null = null;

ipcMain.on("drag-start", () => {
  if (!mainWindow) return;
  const [wx, wy] = mainWindow.getPosition();
  const cursor = screen.getCursorScreenPoint();
  dragOffset = { x: cursor.x - wx, y: cursor.y - wy };
});

ipcMain.on("drag-move", (_e, cursorX: number, cursorY: number) => {
  if (!mainWindow || !dragOffset) return;
  mainWindow.setPosition(cursorX - dragOffset.x, cursorY - dragOffset.y);
});

ipcMain.on("drag-stop", () => {
  if (!mainWindow) return;
  dragOffset = null;
  const [x, y] = mainWindow.getPosition();
  saveConfig({ ...loadConfig(), window: { x, y } });
});

app.whenReady().then(() => {
  // Hide dock icon (macOS), taskbar icon (Windows/Linux handled by skipTaskbar on the window)
  if (app.dock) {
    app.dock.hide();
  }
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
