const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  onUsageData: (callback) =>
    ipcRenderer.on("usage-data", (event, data) => callback(data))
});