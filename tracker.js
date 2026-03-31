const { exec } = require("child_process");

const windowHistory = [];

function getActiveWindow() {
  exec("xdotool getactivewindow getwindowname", (err, stdout, stderr) => {
    if (err) {
      console.error("Error getting active window:", err);
      const last = windowHistory[windowHistory.length - 1]
    }
    if (!last || last.name !== name) {
        windowHistory.push({name, startTime: Date.now() });
        console.log("switched to:", name);
    }

    const windowName = stdout.trim();
    console.log("Active window:", windowName);

    // TODO: store this in my tracker data
    // e.g., history.push({ name: windowName, timestamp: Date.now() });
  });
}

setInterval(getActiveWindow, 1000);


function endPreviousWindow() {
    const last = windowHistory[windowHistory.length - 1];
    if(last && !last.endTime) {
        last.endTime = Date.now();
        last.duration = (last.endTime - last.startTime) / 1000;
        console.log(`Window "${last.name}" was active for ${last.duration.toFixed(1)}s`);
    }
}

const fs = require("fs");
function saveHistory() {
    fs.writeFileSync("windowHistory.json", JSON.stringify(windowHistory, null, 2));
}



