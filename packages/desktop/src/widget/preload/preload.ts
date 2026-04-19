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
});
