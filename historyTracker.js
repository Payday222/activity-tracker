const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const { getAppUsage } = require("./tracker");

const dataDir = path.join(app.getPath("userData"), "dailyHistory");
console.log(`dataDir = ${dataDir}`);

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// EU date format: DD-MM-YYYY
function getTodayFilename() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    const dateEU = `${day}-${month}-${year}`;
    return path.join(dataDir, `${dateEU}.json`);
}

function LoadTodayHistory() {
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

    } catch {
        return { totals: {}, lastSeen: {} };
    }
}

function saveHistory(data) {
    const file = getTodayFilename();
    console.log("saving", data.totals);
    console.log("history path:", file);

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function UpdateDailyHistory() {
    const history = LoadTodayHistory();
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
}

function start() {
    setInterval(UpdateDailyHistory, 1000);
}

module.exports = { start };
