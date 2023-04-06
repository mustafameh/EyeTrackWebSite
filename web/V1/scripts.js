window.addEventListener("load", () => {
  const target = document.getElementById("target");
  const startCalibration = document.getElementById("startCalibration");
  const startTracking = document.getElementById("startTracking");
  const pause = document.getElementById("pause");
  const resume = document.getElementById("resume");
  const saveData = document.getElementById("saveData");

  let isTracking = false;
  let trackingData = [];
  let initialTimestamp = null;

  const sampleInterval = 500;
  const toggleVideo = document.getElementById("toggleVideo");

  let videoVisible = true;
  toggleVideo.addEventListener("click", () => {
    videoVisible = !videoVisible;
    webgazer.showVideoPreview(videoVisible);
  });

  startCalibration.addEventListener("click", () => {
    webgazer.showVideoPreview(true).showPredictionPoints(true);
    startTracking.removeAttribute("disabled");
    startCalibration.setAttribute("disabled", "true");
  });

  startTracking.addEventListener("click", () => {
    isTracking = true;
    initialTimestamp = null;
    startTracking.setAttribute("disabled", "true");
    pause.removeAttribute("disabled");
    saveData.removeAttribute("disabled");
  });

  pause.addEventListener("click", () => {
    webgazer.pause();
    pause.setAttribute("disabled", "true");
    resume.removeAttribute("disabled");
  });

  resume.addEventListener("click", () => {
    webgazer.resume();
    pause.removeAttribute("disabled");
    resume.setAttribute("disabled", "true");
  });

  saveData.addEventListener("click", () => {
    if (trackingData.length > 0) {
      downloadTrackingData(trackingData, "tracking-data.csv");
    }
  });

  webgazer.setGazeListener((data, elapsedTime) => {
    if (!isTracking || data == null) return;
    if (initialTimestamp === null) {
      initialTimestamp = elapsedTime;
      lastSampleTime = elapsedTime;
    }
    const adjustedTimestamp = elapsedTime - initialTimestamp;
    const x = data.x;
    const y = data.y;
  
    // Update the displayed coordinates and timestamp
    document.getElementById("xCoord").textContent = x.toFixed(2);
    document.getElementById("yCoord").textContent = y.toFixed(2);
    document.getElementById("timestamp").textContent = adjustedTimestamp.toFixed(2);
  
    // Save data every 1000ms
    if (elapsedTime - lastSampleTime >= sampleInterval) {
      target.style.left = `${x - target.offsetWidth / 2}px`;
      target.style.top = `${y - target.offsetHeight / 2}px`;
      trackingData.push({ x, y, timestamp: adjustedTimestamp });
      lastSampleTime = elapsedTime;
    }
  }).begin();


  window.addEventListener("beforeunload", () => {
    webgazer.end();
  });
});

function downloadTrackingData(data, filename) {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function convertToCSV(data) {
  const headers = ["x", "y", "timestamp"];
  const csvRows = [headers.join(",")];

  for (const row of data) {
    csvRows.push(`${row.x},${row.y},${row.timestamp}`);
  }

  return csvRows.join("\n");
}

