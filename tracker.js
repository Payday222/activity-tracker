const { exec } = require("child_process");
const fs = require("fs");

const windowHistory = [];

function getActiveWindow() {
  exec("xdotool getactivewindow getwindowname", (err, stdout) => {
    if (err) {
      console.error("Error getting active window:", err);
      return;
    }

    const windowName = stdout
    .trim()
    .replace(/and \d more pages/g, "")
    .trim();
    if (!windowName) return;

    const last = windowHistory[windowHistory.length - 1];

    if (!last || last.name !== windowName) {
      endPreviousWindow();

      windowHistory.push({
        name: windowName,
        startTime: Date.now()
      });

      console.log("Switched to:", windowName);
    }
  });
}

setInterval(getActiveWindow, 1000);

function endPreviousWindow() {
  const last = windowHistory[windowHistory.length - 1];
  if (last && !last.endTime) {
    last.endTime = Date.now();
    last.duration = (last.endTime - last.startTime) / 1000;
    console.log(
      `Window "${last.name}" was active for ${last.duration.toFixed(1)}s`
    );
  }
}

function saveHistory() {
  fs.writeFileSync(
    "windowHistory.json",
    JSON.stringify(windowHistory, null, 2)
  );
}

setInterval(saveHistory, 10000);

function getAppUsage() {
  const totals = {};

  for (const entry of windowHistory) {
    if (!totals[entry.name]) {
      totals[entry.name] = 0;
    }

    if (entry.endTime) {
      totals[entry.name] += entry.duration;
    } else {
      totals[entry.name] += (Date.now() - entry.startTime) / 1000;
    }
  }

  return totals;
}

setInterval(() => {
  const stats = getAppUsage();
  console.log("App usage total:", stats);
}, 5000);