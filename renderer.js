
const appDiv = document.getElementById("app");
const pieColors = {};

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const lineCtx = document.getElementById("lineChart").getContext("2d");
const lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
        labels: [], // timestamps
        datasets: [],
    },
    options: {
        responsive: true,
        plugins: { legend: { display: true } },
             
    }
});

const pieCtx = document.getElementById("pieChart").getContext("2d");
const pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: []
        }]
    },
    options: { responsive: true }
});

window.api.onUsageData((data) => {
const now = new Date().toLocaleTimeString();

lineChart.data.labels.push(now);

Object.entries(data).forEach(([name, value]) => {
    let ds = lineChart.data.datasets.find(d => d.label === name);

    if(!ds) {
        ds = {
        label: name,
        data: [],
        borderColor: getRandomColor(),
        fill: false
        };
        lineChart.data.datasets.push(ds);
    }
    ds.data.push(value);
});

if(lineChart.data.labels.length > 300) {
    lineChart.data.labels.shift();
    lineChart.data.datasets.forEach(ds => ds.data.shift);
}
lineChart.update();

  const labels = Object.keys(data);
  const values = Object.values(data);
  const backgroundColors = [];

  labels.forEach(name => {
    if (!pieColors[name]) {
      pieColors[name] = getRandomColor();
    }
    backgroundColors.push(pieColors[name]);
  });

  appDiv.innerHTML = "";
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
  for (const [name, time] of sorted) {
    const div = document.createElement("div");
    div.textContent = `${name}: ${formatTime(time)}`;
    appDiv.appendChild(div); // yes more raw text data
  }

  pieChart.data.labels = labels;
  pieChart.data.datasets[0].data = values;
  pieChart.data.datasets[0].backgroundColor = backgroundColors;
  pieChart.update();
});

window.api.onTopTenUpdate((topTen) => {
    updateTopTenUI(topTen);
});

function updateTopTenUI(topTen) {
  const list = document.getElementById("topTenList");
  if (!list) return;

  list.innerHTML = "";

  topTen.forEach(entry => {
    if (!entry || typeof entry.total !== "number") return;

    const li = document.createElement("li");
    li.textContent = `${entry.name} — ${formatTime(entry.total)}`;
    list.appendChild(li);
  });
}
function formatTime(seconds) {
  seconds = Math.floor(seconds);

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }

  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }

  return `${secs}s`;
}

window.api.onTotalUsetimeUpdate((totalUsetime) => {
  TotalUsetimeUpdate(formatTime(totalUsetime/1000));
});

function TotalUsetimeUpdate(totalUsetime) {
  const display = document.getElementById("usetime-display");
  display.textContent = `Total usetime: ${totalUsetime}`;
}