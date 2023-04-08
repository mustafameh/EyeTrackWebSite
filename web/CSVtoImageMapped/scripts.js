// Helper function to parse the CSV data
function parseCSV(csvData) {
    const rows = csvData.split("\n");
    const data = rows.slice(1).map(row => {
        const [x, y, time] = row.split(",");
        return { x: parseFloat(x), y: parseFloat(y), time: parseFloat(time) };
    });
    return data;
}

// Helper function to apply exponential moving average smoothing
function applyExponentialMovingAverage(data, alpha) {
    const smoothedData = [data[0]];
    for (let i = 1; i < data.length; i++) {
        const currentData = data[i];
        const previousData = smoothedData[i - 1];
        const smoothedX = alpha * currentData.x + (1 - alpha) * previousData.x;
        const smoothedY = alpha * currentData.y + (1 - alpha) * previousData.y;
        smoothedData.push({ x: smoothedX, y: smoothedY, time: currentData.time });
    }
    return smoothedData;
}

// Function to render the image based on eye-tracking data
function renderImage(data, canvasId) {
    const eyeTrackingCanvas = document.getElementById(canvasId);
    const ctx = eyeTrackingCanvas.getContext("2d");

    // Set canvas dimensions and background color
    eyeTrackingCanvas.width = 1920;
    eyeTrackingCanvas.height = 1080;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, eyeTrackingCanvas.width, eyeTrackingCanvas.height);

    // Draw eye-tracking data points and lines
    ctx.lineWidth = 1;
    for (let i = 0; i < data.length; i++) {
        const point = data[i];
        const nextPoint = data[i + 1];

        // Draw a circle for the current point
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();

        // Draw a line connecting the current point and the next point
        if (nextPoint) {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(nextPoint.x, nextPoint.y);
            const gradient = ctx.createLinearGradient(point.x, point.y, nextPoint.x, nextPoint.y);
            gradient.addColorStop(0, "rgba(255, 0, 0, 0.5)");
            gradient.addColorStop(1, "rgba(0, 255, 0, 0.5)");
            ctx.strokeStyle = gradient;
            ctx.stroke();
        }
    }
}

// Function to process the CSV file and render the images
function processCSV(csvFile) {
    const reader = new FileReader();
    reader.onload = (event) => {
        const data = parseCSV(event.target.result);

        // Render the original image
        renderImage(data, "eye-tracking-canvas-original");

        // Apply the exponential moving average filter to the data
        const smoothingLevelSelect = document.getElementById("smoothing-level");
        const smoothingLevel = parseFloat(smoothingLevelSelect.value);
        
        const smoothedData = applyExponentialMovingAverage(data, smoothingLevel);

        // Render the smoothed image
        renderImage(smoothedData, "eye-tracking-canvas-smooth");

    };
    reader.readAsText(csvFile);
}

// Event listener for file input
const fileInput = document.getElementById("file-input");
fileInput.addEventListener("change", (event) => {
    const csvFile = event.target.files[0];
    processCSV(csvFile);
});

document.getElementById("record-eye-tracking").addEventListener("click", function () {
    window.location.href = "C:/Users/786me/Desktop/WebGaze/EyeTrackingWebsite/EyeTrackWebSite/web/V2/main.html";
});

function updateSmoothedImage() {
    const smoothingLevelSelect = document.getElementById("smoothing-level");
    const smoothingLevel = parseFloat(smoothingLevelSelect.value);

    // Re-process the CSV file with the new smoothing level
    if (fileInput.files.length > 0) {
        const csvFile = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = parseCSV(event.target.result);

            // Apply the exponential moving average filter to the data
            const smoothedData = applyExponentialMovingAverage(data, smoothingLevel);

            // Render the smoothed image
            renderImage(smoothedData, "eye-tracking-canvas-smooth");
        };
        reader.readAsText(csvFile);
    }
}

document.getElementById("apply-smoothing").addEventListener("click", updateSmoothedImage);




