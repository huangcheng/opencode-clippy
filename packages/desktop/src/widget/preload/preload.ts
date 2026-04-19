const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("clippy", {
  onEvent: (callback: (event: unknown) => void) => {
    ipcRenderer.on("clippy-event", (_event: unknown, data: unknown) => {
      callback(data);
    });
  },
  startDrag: () => ipcRenderer.send("drag-start"),
  moveDrag: (x: number, y: number) => ipcRenderer.send("drag-move", x, y),
  stopDrag: () => ipcRenderer.send("drag-stop"),
  getConfig: () => ipcRenderer.invoke("get-config"),
  setConfig: (partial: Record<string, unknown>) => ipcRenderer.invoke("set-config", partial),
  onSettingsOpen: (callback: () => void) => {
    ipcRenderer.on("open-settings", () => callback());
  },
});
