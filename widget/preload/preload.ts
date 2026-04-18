const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("clippy", {
  onEvent: (callback: (event: unknown) => void) => {
    ipcRenderer.on("clippy-event", (_event: unknown, data: unknown) => {
      callback(data);
    });
  },
});
