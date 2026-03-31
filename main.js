const { app, BrowserWindow } = require("electron");
const path = require("path");
const tracker = require("./tracker");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  mainWindow.loadFile("index.html");

  tracker.start((stats) => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send("usage-data", stats);
    }
  });
}

app.whenReady().then(createWindow);