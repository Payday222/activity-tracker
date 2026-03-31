const { exec } = require("child_process");

const windowHistory = [];
const topTen = [];

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
  setInterval(getActiveWindow, 1000);
  setInterval(() => {
    const stats = getAppUsage();
    callback(stats);    
  }, 1000);
  setInterval(FindTopTen, 1000);
}

function FindTopTen() {
  windowHistory.forEach(entry => entry.used = false);

  for (let i = 0; i < 10; i++) {
    let largest = null;

    windowHistory.forEach(entry => {
      if (entry.used) return;

      let entryRuntime = entry.endTime
        ? entry.duration
        : (Date.now() - entry.startTime);

      if (largest === null) {
        largest = entry;
        return;
      }

      let largestRuntime = largest.endTime
        ? largest.duration
        : (Date.now() - largest.startTime);

      if (entryRuntime > largestRuntime) {
        largest = entry;
      }
    });

    topTen[i] = largest;

    if (largest) {
      largest.used = true;
    } else {
      break;
    }
  }

  console.log(topTen);
}

module.exports = { start };