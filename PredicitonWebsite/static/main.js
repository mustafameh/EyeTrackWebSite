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

// Get new DOM elements
const retrainModelSelect = document.getElementById("retrain-model-select");
const chooseDatasetBtn = document.getElementById("choose-dataset-btn");
const datasetFolder = document.getElementById("dataset-folder");
const chosenDirectory = document.getElementById("chosen-directory");
const startTrainingBtn = document.getElementById("start-training-btn");
const epochsInput = document.getElementById("epochs");
const trainingInfo = document.getElementById("training-info");

// Populate the retrain model selection dropdown with the same models as the prediction dropdown
modelSelect.addEventListener("change", () => {
  retrainModelSelect.innerHTML = modelSelect.innerHTML;
});

// Handle dataset directory selection
chooseDatasetBtn.addEventListener("click", () => {
  datasetFolder.click();
});

datasetFolder.addEventListener("change", (event) => {
  chosenDirectory.textContent = `Chosen directory: ${event.target.files[0].webkitRelativePath.split("/")[0]}`;
});

// Handle starting the retraining process
startTrainingBtn.addEventListener("click", () => {
  const formData = new FormData();
  formData.append("model", retrainModelSelect.value);
  formData.append("epochs", epochsInput.value);

  // Append all the dataset files to the form data
  for (const file of datasetFolder.files) {
    formData.append("dataset[]", file, file.webkitRelativePath);
  }

  fetch("/retrain", {
    method: "POST",
    body: formData
  }).then(response => {
    if (response.ok) {
      alert("Training started successfully");
    } else {
      alert("Failed to start training");
    }
  });
});

// Get DOM elements for retrain section
const uploadRetrainModelBtn = document.getElementById("upload-retrain-model-btn");
const retrainModelUpload = document.getElementById("retrain-model-upload");

// Fetch pre-trained models and populate both model selection dropdowns
fetch("/models")
  .then(response => response.json())
  .then(models => {
    models.forEach(model => {
      const option = document.createElement("option");
      option.value = model;
      option.text = model;
      modelSelect.add(option.cloneNode(true));
      retrainModelSelect.add(option);
    });
  });



retrainModelUpload.addEventListener("change", (event) => {
  const formData = new FormData();
  formData.append("model", event.target.files[0]);

  fetch("/upload_model", {
    method: "POST",
    body: formData
  }).then(response => {
    if (response.ok) {
      alert("Model uploaded successfully for retraining");
    } else {
      alert("Failed to upload the model for retraining");
    }
  });
});



  



