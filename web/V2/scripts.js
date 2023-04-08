// Get elements from HTML
const beginTracking = document.getElementById("begin-tracking");
const beginRecording = document.getElementById("begin-recording");
const toggleVideoPreview = document.getElementById("toggle-video-preview");
const pauseTracking = document.getElementById("pause-tracking");
const resumeTracking = document.getElementById("resume-tracking");
const save = document.getElementById("save");
const timestamp = document.getElementById("timestamp");
const coordinates = document.getElementById("coordinates");

// Initialize variables
let recording = false;
let startTime = 0;
let baseTime = 0;
let recordedData = [];

let lastRecordedTime = 0;
let samplingInterval = 1000;

// Initialize Webgazer and set Gaze Listener
function initializeWebgazer() {
    webgazer.setGazeListener((data, elapsedTime) => {
        if (data == null) {
            return;
        }

        const x = data.x;
        const y = data.y;

        const currentTime = elapsedTime / 1000;

        // Update coordinates and timestamp
        coordinates.innerText = `X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`;
                // Update coordinates and timestamp
                timestamp.innerText = `Time: ${currentTime.toFixed(3)} s`;

                // Record data if recording is active and time since last recording is greater than or equal to the sampling interval
                if (recording && (currentTime - lastRecordedTime >= samplingInterval / 1000)) {
                    recordedData.push({x, y, time: currentTime});
                    lastRecordedTime = currentTime;
                }
                
            }).begin();

        }
        
        // Get elements related to sampling interval
        const samplingIntervalInput = document.getElementById("sampling-interval");
        const intervalDisplay = document.getElementById("interval-display");
        const applySamplingIntervalButton = document.getElementById("apply-sampling-interval");
        
        // Update interval display when input changes
        samplingIntervalInput.addEventListener("input", () => {
            intervalDisplay.textContent = samplingIntervalInput.value;
        });
        
        // Update sampling interval when apply button is clicked
        applySamplingIntervalButton.addEventListener("click", () => {
            samplingInterval = parseInt(samplingIntervalInput.value);
        });
        
        // Download recorded data as CSV
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
        
        // Event listeners for buttons
        beginTracking.addEventListener("click", () => {
            initializeWebgazer();
            setButtonsDisabled(false);
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
        
        // Elements and event listener for regression model selection
        const applyModel = document.getElementById("apply-model");
        const regressionModelDropdown = document.getElementById("regression-model");
        
        // Set regression model in Webgazer
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
        
        // Event listener for visualize data button
        document.getElementById("visualize-data").addEventListener("click", function () {
            window.location.href = "file:///C:/Users/786me/Desktop/WebGaze/EyeTrackingWebsite/EyeTrackWebSite/web/CSVtoImageMapped/index.html";
        });
        ;

// Calibration
const startCalibration = document.getElementById("start-calibration");
const calibrationPopup = document.getElementById("calibration-popup");
const closeButton = document.getElementById("close-button");
const calibrationPoints = document.querySelectorAll(".calibration-point");
//Message
const marqueeMessage = document.getElementById("marquee-message");
marqueeMessage.textContent = "WebGazer.js contains an eye tracking model that self-calibrates by watching web visitors interact with the web page and trains a mapping between the features of the eye and positions on the screen";

function showCalibrationPopup() {
  calibrationPopup.style.display = "block";
}

function hideCalibrationPopup() {
  calibrationPopup.style.display = "none";
}

function toggleCalibrationPoint(event) {
    const point = event.target;
    if (point.classList.contains("selected")) {
      point.classList.remove("selected");
      point.classList.add("green");
    } else if (point.classList.contains("green")) {
      point.classList.remove("green");
    } else {
      point.classList.add("selected");
    }
  }
  

startCalibration.addEventListener("click", showCalibrationPopup, true);
closeButton.addEventListener("click", hideCalibrationPopup, true);

calibrationPoints.forEach(point => {
  point.addEventListener("click", toggleCalibrationPoint, true);
});

//disabling the buttons unless Begin Tracking is clicked
function setButtonsDisabled(disabled) {
  beginRecording.disabled = disabled;
  toggleVideoPreview.disabled = disabled;
  pauseTracking.disabled = disabled;
  resumeTracking.disabled = disabled;
  save.disabled = disabled;
  applySamplingIntervalButton.disabled = disabled;
  applyModel.disabled = disabled;
  startCalibration.disabled = disabled;
}
setButtonsDisabled(true);




  



   



