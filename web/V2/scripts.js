const beginTracking = document.getElementById("begin-tracking");
const beginRecording = document.getElementById("begin-recording");
const toggleVideoPreview = document.getElementById("toggle-video-preview");
const pauseTracking = document.getElementById("pause-tracking");
const resumeTracking = document.getElementById("resume-tracking");
const save = document.getElementById("save");
const timestamp = document.getElementById("timestamp");
const coordinates = document.getElementById("coordinates");

let recording = false;
let startTime = 0;
let baseTime = 0;
let recordedData = [];

let lastRecordedTime = 0;

function initializeWebgazer() {
    webgazer.setGazeListener((data, elapsedTime) => {
        if (data == null) {
            return;
        }

        const x = data.x;
        const y = data.y;

        const currentTime = elapsedTime / 1000;

        coordinates.innerText = `X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`;
        timestamp.innerText = `Time: ${currentTime.toFixed(3)} s`;

        if (recording && (currentTime - lastRecordedTime >= 1)) {
            recordedData.push({x, y, time: currentTime});
            lastRecordedTime = currentTime;
        }

        
    }).begin();
}

function downloadCSV() {
    const header = "x,y,time\n";
    let csvContent = recordedData.map(e => `${e.x},${e.y},${e.time}`).join("\n");
    let blob = new Blob([header + csvContent], {type: "text/csv"});
    let url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "eye_tracking_data.csv";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

beginTracking.addEventListener("click", () => {
    initializeWebgazer();
});

beginRecording.addEventListener("click", () => {
    if (!recording) {
        recording = true;
        startTime = parseFloat((Date.now() / 1000).toFixed(3));
        recordedData = [];
        beginRecording.textContent = "Stop Recording";
    } else {
        recording = false;
        beginRecording.textContent = "Begin Recording";
    }
});

toggleVideoPreview.addEventListener("click", () => {
    const video = document.querySelector("video");
    video.style.display = video.style.display === "none" ? "" : "none";
});

pauseTracking.addEventListener("click", () => {
    webgazer.pause();
});

resumeTracking.addEventListener("click", () => {
    webgazer.resume();
});

save.addEventListener("click", () => {
    if (recording) {
        beginRecording.click();
    }
    downloadCSV();
});

const applyModel = document.getElementById("apply-model");
const regressionModelDropdown = document.getElementById("regression-model");

function setRegressionModel(model) {
    switch (model) {
      case "ridge":
        webgazer.setRegression("ridge");
        break;
      case "weightedRidge":
        webgazer.setRegression("weightedRidge");
        break;
      default:
        console.error("Unknown regression model:", model);
    }
  }

applyModel.addEventListener("click", () => {
  const selectedModel = regressionModelDropdown.value;
  setRegressionModel(selectedModel);
});

document.getElementById("visualize-data").addEventListener("click", function () {
    window.location.href = "file:///C:/Users/786me/Desktop/WebGaze/EyeTrackingWebsite/EyeTrackWebSite/web/CSVtoImageMapped/index.html";
});

   



