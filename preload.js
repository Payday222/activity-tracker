const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  onUsageData: (callback) =>
    ipcRenderer.on("usage-data", (event, data) => callback(data)),
  
  onTopTenUpdate: (callback) =>
    ipcRenderer.on("top-ten-update", (event, data) => callback(data)),
  onTotalUsetimeUpdate: (callback) => 
    ipcRenderer.on("total-usetime-update", (event, data) => callback(data))
});