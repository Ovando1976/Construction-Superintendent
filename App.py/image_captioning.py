import requests
import json

subscription_key = 'YOUR_SUBSCRIPTION_KEY'
endpoint = 'https://YOUR_ENDPOINT.cognitiveservices.azure.com/'

def generate_caption(image_url):
    headers = {'Ocp-Apim-Subscription-Key': subscription_key,
               'Content-Type': 'application/json'}
    data = {'url': image_url}
    response = requests.post(endpoint + 'vision/v3.0/describe',
                             headers=headers, json=data)
    response.raise_for_status()
    captions = response.json()['description']['captions']
    return [c['text'] for c in captions]
