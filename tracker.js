const { exec } = require("child_process");
const { BrowserWindow } = require("electron");
const windowHistory = [];
const topTen = [];
let ThisStartTime = 0;
function endPreviousWindow() {
  const last = windowHistory[windowHistory.length - 1];
  if (last && !last.endTime) {
    last.endTime = Date.now();
    last.duration = (last.endTime - last.startTime) / 1000;
  }
}

function getActiveWindow() {
  exec("xdotool getactivewindow getwindowname", (err, stdout) => {
    if (err) {
      
      if (!/BadWindow/.test(err.message)) console.error(err);
      return;
    }

    let windowName = stdout.trim();
    windowName = windowName.replace(/and \d+ other pages/g, "").trim();
    if (!windowName) return;

    const last = windowHistory[windowHistory.length - 1];

    if (!last || last.name !== windowName) {
      endPreviousWindow();
      windowHistory.push({ name: windowName, startTime: Date.now() });
    }
  });
}

function getAppUsage() {
  const totals = {};
  for (const entry of windowHistory) {
    if (!totals[entry.name]) totals[entry.name] = 0;
    totals[entry.name] += entry.endTime
      ? entry.duration
      : (Date.now() - entry.startTime) / 1000;
  }
  return totals;
}


function start(callback) {
  ThisStartTime = Date.now();
  setInterval(getActiveWindow, 1000);
  setInterval(() => {
    const stats = getAppUsage();
    callback(stats);    
  }, 1000);
  setInterval(FindTopTen, 1000);
  setInterval(CalculateTotalUseTime, 1000);
}

function FindTopTen() {
  const totals = getAppUsage();
  const arr = Object.entries(totals)
    .map(([name, total]) => ({
      name,
      total: Number(total) || 0 
    }))
    .filter(entry => entry.total > 0); 
  arr.sort((a, b) => b.total - a.total);
  const topTen = arr.slice(0, 10);
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send("top-ten-update", topTen);
  }
}

function CalculateTotalUseTime() {
totalRuntime = Date.now() - ThisStartTime;

const win = BrowserWindow.getAllWindows()[0];
if(win) {
  win.webContents.send("total-usetime-update", totalRuntime);
}
}

module.exports = { start,
  getAppUsage
 };
