from flask import Flask, render_template, request, jsonify
from chatbot import get_response as chatbot_response
from text_to_speech import generate_speech as text_to_speech
from audio_conversion import convert_audio
from speech_to_text import transcribe_audio
from stable_diffusion import perform_stable_diffusion
from video_animation import animate_video

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-response', methods=['POST'])
def get_response():
    user_input = request.form['user_input']
    chatbot_output = chatbot_response(user_input)
    return jsonify({'chatbot_response': chatbot_output})

@app.route('/text-to-speech', methods=['POST'])
def text_to_speech_route():
    text = request.form['text']
    output_format = request.form['output_format']
    audio_file = text_to_speech(text, output_format)
    return audio_file

@app.route('/audio-conversion', methods=['POST'])
def audio_conversion_route():
    input_file = request.form['input_file']
    output_file = request.form['output_file']
    output_format = request.form['output_format']
    convert_audio(input_file, output_file, output_format)
    return jsonify({'message': 'Audio conversion successful!'})

@app.route('/speech-to-text', methods=['POST'])
def speech_to_text_route():
    audio_file = request.files['audio_file']
    transcription = transcribe_audio(audio_file)
    return jsonify({'transcription': transcription})

@app.route('/stable-diffusion', methods=['POST'])
def stable_diffusion_route():
    input_image_path = request.files['input_image'].filename
    output_image_path = request.files['output_image'].filename
    perform_stable_diffusion(input_image_path, output_image_path)
    return jsonify({'message': 'Stable diffusion successful!'})

@app.route('/video-animation', methods=['POST'])
def video_animation_route():
    video_file = request.files['video_file']
    animate_video(video_file)
    return jsonify({'message': 'Video animation successful!'})

if __name__ == '__main__':
    app.run(debug=True)
