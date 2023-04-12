from flask import Flask, render_template, request, redirect, url_for, flash
import tensorflow as tf
from keras.models import load_model
from keras.preprocessing.image import ImageDataGenerator
from PIL import Image
import numpy as np
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'


# Route for uploading dataset and training
@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        dataset = request.files.get('dataset')
        if dataset:
            # Create the uploads directory if it doesn't exist
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

            dataset.save(os.path.join(app.config['UPLOAD_FOLDER'], 'dataset.zip'))
        
        epochs = request.form.get('epochs')
        if epochs:
            retrain_model(int(epochs))
    
    return render_template('index.html')

     
#Function for retraining 

def retrain_model(epochs):
    # Load the pretrained model
    model = load_model('model.h5')

    # Extract the dataset
    import zipfile
    with zipfile.ZipFile(os.path.join(app.config['UPLOAD_FOLDER'], 'dataset.zip'), 'r') as zip_ref:
        zip_ref.extractall(app.config['UPLOAD_FOLDER'])

    # Create an ImageDataGenerator for data augmentation
    datagen = ImageDataGenerator(
        rescale=1. / 255,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        validation_split=0.2)  # Add this line for splitting the dataset into training and validation sets

    # Set batch size and image size
    batch_size = 32
    img_width, img_height = 224, 224

    # Specify the dataset folder
    dataset_folder = os.path.join(app.config['UPLOAD_FOLDER'], 'dataset')

    # Prepare data for training
    train_generator = datagen.flow_from_directory(
        dataset_folder,
        target_size=(img_width, img_height),
        batch_size=batch_size,
        class_mode='binary',
        subset='training')  # Add this line to use only the training portion of the dataset

    # Prepare data for validation
    validation_generator = datagen.flow_from_directory(
        dataset_folder,
        target_size=(img_width, img_height),
        batch_size=batch_size,
        class_mode='binary',
        subset='validation')

    # Retrain the model
    history = model.fit(
        train_generator,
        steps_per_epoch=train_generator.samples // batch_size,
        epochs=epochs,
        validation_data=validation_generator,
        validation_steps=validation_generator.samples // batch_size)

    # Save the retrained model
    model.save('model_retrained.h5')

    # Display training accuracy, epoch number, and loss
    for epoch, acc, loss in zip(range(1, epochs + 1), history.history['accuracy'], history.history['loss']):
        print(f"Epoch: {epoch}, Accuracy: {acc:.2f}, Loss: {loss:.2f}")

if __name__ == '__main__':

    app.run(debug=True, use_reloader=False)

