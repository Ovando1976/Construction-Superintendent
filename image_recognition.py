import io
import os
from google.cloud import vision

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'YOUR_CREDENTIALS_FILE.json'

client = vision.ImageAnnotatorClient()

def recognize_image(image_file):
    with io.open(image_file, 'rb') as f:
        content = f.read()
    image = vision.types.Image(content=content)
    response = client.label_detection(image=image)
    labels = [label.description.lower() for label in response.label_annotations]
    return labels
