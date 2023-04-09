import io
from google.cloud import speech

def transcribe_audio(audio_file):
    client = speech.SpeechClient()
    with io.open(audio_file, 'rb') as audio:
        content = audio.read()
    audio = speech.types.RecognitionAudio(content=content)
    config = speech.types.RecognitionConfig(
        encoding=speech.enums.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code='en-US')
    response = client.recognize(config, audio)
    transcript = response.results[0].alternatives[0].transcript
    return transcript
