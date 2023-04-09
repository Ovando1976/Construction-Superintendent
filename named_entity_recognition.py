import spacy

nlp = spacy.load('en_core_web_sm')

def extract_entities(text):
    doc = nlp(text)
    entities = []
    for entity in doc.ents:
        entities.append((entity.text, entity.label_))
    return entities
