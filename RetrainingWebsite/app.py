from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory
import tensorflow as tf
from keras.models import load_model
from keras.preprocessing.image import ImageDataGenerator
from PIL import Image
import numpy as np
import os
import shutil
import glob

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.secret_key = 'secret-key'

# Route for uploading dataset
@app.route("/upload", methods=["POST"])
def upload_dataset():
    if request.method == "POST":
        dataset = request.files.get('dataset')
        if dataset:
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            dataset.save(os.path.join(app.config['UPLOAD_FOLDER'], 'dataset.zip'))
            flash("Zip file successfully uploaded.")
        return redirect(url_for("home"))

# Route for handling model selection and training
@app.route('/', methods=['GET', 'POST'])
def home():
    models = [os.path.basename(f) for f in glob.glob('*.h5')]

    if request.method == 'POST':
        epochs = request.form.get('epochs')
        model_name = request.form.get('model')
        
        if epochs and model_name:
            dataset_path = os.path.join(app.config['UPLOAD_FOLDER'], 'dataset.zip')
            if os.path.isfile(dataset_path):
                retrain_model(int(epochs), model_name)
            else:
                flash("Dataset not found. Please upload the dataset before Starting Training.")
    
    return render_template('index.html', models=models)


     
#Function for retraining 

def retrain_model(epochs, model_filename):
    # Load the selected model
    model = load_model(model_filename)

    
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

    # Call clean_upload_folder() after the training process is complete
    clean_upload_folder()

    # Re-enable the "Start Training" button and update the flashed message
    flash("Training has finished. You can now download the retrained model.")

def clean_upload_folder():
    folder = app.config['UPLOAD_FOLDER']
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')


# new routine For downloading the retrained model and then delete it from local mempry after downloading using threading
from flask import send_from_directory

import threading
import time

def delete_file(filepath):
    while True:
        try:
            os.remove(filepath)
            print(f"Local copy of {filepath} deleted.")
            break
        except Exception as e:
            print(f"Failed to delete local copy of {filepath}. Retrying...")
            time.sleep(1)

@app.route('/download', methods=['GET'])
def download():
    try:
        response = send_from_directory(directory='', path='model_retrained.h5', as_attachment=True)

        t = threading.Thread(target=delete_file, args=('model_retrained.h5',))
        t.start()

        return response
    except Exception as e:
        print(f"Failed to download retrained model. Reason: {e}")
        return redirect(url_for('home'))



def file_exists(filepath):
    return os.path.isfile(filepath)


app.jinja_env.globals['file_exists'] = file_exists
if __name__ == '__main__':

    app.run(debug=True, use_reloader=False)
