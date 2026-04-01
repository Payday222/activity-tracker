const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const { getAppUsage } = require("./tracker");

const dataDir = path.join(app.getPath("userData"), "dailyHistory");
console.log(`Daily history directory: ${dataDir}`);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

function getTodayFilename() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return path.join(dataDir, `${day}-${month}-${year}.json`);
}

function loadTodayHistory() {
  const file = getTodayFilename();

  if (!fs.existsSync(file)) {
    return { totals: {}, lastSeen: {} };
  }

  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));

    if (data.totals && data.lastSeen) {
      return data;
    }

    console.log("Migrating old history format → new format");
    return {
      totals: data,
      lastSeen: {}
    };

  } catch (err) {
    console.warn("Failed to read history file, resetting:", err);
    return { totals: {}, lastSeen: {} };
  }
}

function saveHistory(data) {
  const file = getTodayFilename();
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to save history:", err);
  }
}

function UpdateDailyHistory() {
  const history = loadTodayHistory();
  const totals = history.totals;
  const lastSeen = history.lastSeen;

  const currentTotals = getAppUsage();

  for (const app in currentTotals) {
    const current = currentTotals[app];
    const last = lastSeen[app] ?? 0;
    const saved = totals[app] ?? 0;

    let delta = 0;

    if (current < last) {
      delta = current;
    } else {
      delta = current - last;
    }

    totals[app] = saved + delta;
    lastSeen[app] = current;
  }

  saveHistory({ totals, lastSeen });

  return totals;
}

function start() {
  setInterval(UpdateDailyHistory, 1000);
}

module.exports = { start, UpdateDailyHistory };
