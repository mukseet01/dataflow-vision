
import re
import spacy
from typing import List
from models.schemas import EntityModel

# Load spaCy NER model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    import os
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def extract_entities_with_ner(text: str) -> List[EntityModel]:
    """Extract entities using spaCy NER."""
    entities = []
    doc = nlp(text)
    
    # Process named entities
    for ent in doc.ents:
        entities.append(EntityModel(
            type=ent.label_,
            value=ent.text,
            confidence=0.85,  # Default confidence
            position={
                "start": ent.start_char,
                "end": ent.end_char
            }
        ))
    
    # Add custom regex patterns for common data types
    patterns = {
        "EMAIL": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        "PHONE": r'\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b',
        "DATE": r'\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b',
        "ADDRESS": r'\b\d+\s+[A-Za-z0-9\s,]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|court|ct|lane|ln|way|parkway|pkwy)\b',
        "MONEY": r'\$\s*\d+(?:\.\d{2})?'
    }
    
    for entity_type, pattern in patterns.items():
        for match in re.finditer(pattern, text, re.IGNORECASE):
            entities.append(EntityModel(
                type=entity_type,
                value=match.group(),
                confidence=0.9,
                position={
                    "start": match.start(),
                    "end": match.end()
                }
            ))
    
    return entities
