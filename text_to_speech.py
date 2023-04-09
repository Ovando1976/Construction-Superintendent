import io
import os
from google.cloud import speech_v1p1beta1 as speech

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'YOUR_CREDENTIALS_FILE.json'

client = speech.SpeechClient()

def transcribe_audio(audio_file):
    with io.open(audio_file, 'rb') as f:
        content = f.read()
    audio = speech.types.RecognitionAudio(content=content)
    config = speech.types.RecognitionConfig(
        encoding=speech.enums.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code='en-US'
    )
    response = client.recognize(config=config, audio=audio)
    transcription = response.results[0].alternatives[0].transcript
    return transcription
