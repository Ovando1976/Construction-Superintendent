from flask import Flask, request, jsonify
from chatbot import run_chatbot
from image_recognition import recognize_image
from named_entity_recognition import extract_entities

app = Flask(__name__)

@app.route('/')
def index():
    return 'Welcome to ChatGPT4!'

@app.route('/chatbot', methods=['POST'])
def chatbot():
    message = request.json['message']
    response = run_chatbot(message)
    return jsonify({'response': response})

@app.route('/image_recognition', methods=['POST'])
def image_recognition():
    image_file = request.files['image']
    labels = recognize_image(image_file)
    return jsonify({'labels': labels})

@app.route('/named_entity_recognition', methods=['POST'])
def named_entity_recognition():
    text = request.json['text']
    entities = extract_entities(text)
    return jsonify({'entities': entities})

if __name__ == '__main__':
    app.run(debug=True)
