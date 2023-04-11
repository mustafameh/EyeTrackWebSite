from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import tensorflow as tf
import os
import io
from PIL import Image
import numpy as np
import tempfile
import shutil
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import zipfile

app = Flask(__name__)
CORS(app)
models_path = r'C:\Users\786me\Desktop\FinalYearProject\EyeTrackWebSite\ml_website'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/models', methods=['GET'])
def get_models():
    # Return a list of pre-trained models from the local directory
    models = [file for file in os.listdir(models_path) if file.endswith(".h5")]
    return jsonify(models)

@app.route('/predict', methods=['POST'])
def predict():
    # Load the selected model
    model_name = request.form.get("model")
    model = tf.keras.models.load_model(os.path.join(models_path, model_name))

    # Load and preprocess the uploaded image
    image = request.files.get("image")
    img = Image.open(io.BytesIO(image.read())).resize((224, 224))  # Adjust the size based on your model's input size
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0)

    # Make a prediction
    prediction = model.predict(img_array)
    result = {"prediction": "Class 1" if prediction[0][0] > 0.5 else "Class 0"}

    return jsonify(result)

@app.route('/upload_model', methods=['POST'])
def upload_model():
    # Save the uploaded model to the local directory
    model = request.files.get("model")
    model.save(os.path.join(models_path, model.filename))
    return "Model uploaded successfully", 200

@app.route('/retrain', methods=['POST'])
def retrain():
    model_name = request.form.get("model")
    epochs = int(request.form.get("epochs"))
    
    dataset_folder = request.files.get("dataset")
    dataset_path = os.path.join(tempfile.gettempdir(), "dataset")
    if os.path.exists(dataset_path):
        shutil.rmtree(dataset_path)
    os.makedirs(dataset_path)
    
    with zipfile.ZipFile(io.BytesIO(dataset_folder.read())) as zf:
        zf.extractall(dataset_path)
    
    train_datagen = ImageDataGenerator(rescale=1./255)
    train_generator = train_datagen.flow_from_directory(
        os.path.normpath(os.path.join(dataset_path, "Dataset")),  # Normalize the path here
        target_size=(224, 224),
        batch_size=32,
        class_mode='binary'
    )
    
    model = tf.keras.models.load_model(os.path.join(models_path, model_name))
    model.fit(train_generator, epochs=epochs)
    
    model.save(os.path.join(models_path, f"retrained_{model_name}"))
    return "Model retrained successfully", 200


if __name__ == '__main__':
    app.run(debug=True)
