// Get DOM elements
const modelSelect = document.getElementById("model-select");
const uploadModelBtn = document.getElementById("upload-model-btn");
const modelUpload = document.getElementById("model-upload");
const imageInput = document.getElementById("image-input");
const uploadedImage = document.getElementById("uploaded-image");
const predictBtn = document.getElementById("predict-btn");
const resultsDisplay = document.getElementById("results-display");
const predictionResult = document.getElementById("prediction-result");

// Fetch pre-trained models and populate the model selection dropdown
fetch("/models")
  .then(response => response.json())
  .then(models => {
    models.forEach(model => {
      const option = document.createElement("option");
      option.value = model;
      option.text = model;
      modelSelect.add(option);
    });
  });

// Handle custom model upload
uploadModelBtn.addEventListener("click", () => {
  modelUpload.click();
});

modelUpload.addEventListener("change", (event) => {
  const formData = new FormData();
  formData.append("model", event.target.files[0]);

  fetch("/upload_model", {
    method: "POST",
    body: formData
  }).then(response => {
    if (response.ok) {
      alert("Model uploaded successfully");
    } else {
      alert("Failed to upload the model");
    }
  });
});

// Handle image upload and preview
imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImage.src = e.target.result;
    uploadedImage.classList.remove("d-none");
  };
  reader.readAsDataURL(file);
});

// Handle prediction
predictBtn.addEventListener("click", () => {
  const class0Name = document.getElementById("class-0-name").value || "Class 0";
  const class1Name = document.getElementById("class-1-name").value || "Class 1";

  const formData = new FormData();
  formData.append("image", imageInput.files[0]);
  formData.append("model", modelSelect.value);

  fetch("/predict", {
    method: "POST",
    body: formData
  }).then(response => response.json())
    .then(result => {
      resultsDisplay.classList.remove("d-none");
      predictionResult.textContent = `Prediction: ${result.prediction === "Class 1" ? class1Name : class0Name}`;
    });
});
