"""
PII Detector — hybrid regex + transformer NER pipeline.
Detects Indian (Aadhaar, PAN, Passport, IFSC) and global PII
(email, phone, credit card, person names).
"""

import re
from dataclasses import dataclass, field, asdict
from typing import List, Optional

try:
    from transformers import pipeline as hf_pipeline
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass
class PIIEntity:
    text: str
    label: str        # e.g. "EMAIL", "AADHAAR", "PERSON"
    start: int
    end: int
    score: float      # 0–1, confidence
    source: str       # "regex" | "ner"

    def to_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------------------
# Regex patterns
# ---------------------------------------------------------------------------

PATTERNS: dict[str, str] = {
    "EMAIL":        r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
    # Indian-specific patterns (more specific, checked before generic phone patterns)
    "AADHAAR":      r"\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b",
    "PAN":          r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",
    "PASSPORT_IN":  r"\b[A-PR-WY][1-9]\d\s?\d{4}[1-9]\b",
    "IFSC":         r"\b[A-Z]{4}0[A-Z0-9]{6}\b",
    # Credit card and SSN (specific patterns, checked before generic PHONE_INTL)
    "CREDIT_CARD":  r"\b(?:\d{4}[\s\-]?){3}\d{4}\b",
    "SSN":          r"\b\d{3}[\s\-]\d{2}[\s\-]\d{4}\b",
    # Phone patterns
    "PHONE_IN":     r"\b(?:\+91[\s\-]?)?[6-9]\d{9}\b",
    "PHONE_INTL":   r"\+?[1-9]\d{1,3}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{4}",
    # Generic patterns
    "IPV4":         r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
    "DATE_OF_BIRTH": r"\b(?:DOB|D\.O\.B|Date of Birth)[:\s]+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b",
    "URL":          r"https?://[^\s]+",
}

# Compile once
_COMPILED: dict[str, re.Pattern] = {
    label: re.compile(pattern, re.IGNORECASE)
    for label, pattern in PATTERNS.items()
}


# ---------------------------------------------------------------------------
# NER model (lazy-loaded)
# ---------------------------------------------------------------------------

_ner_pipeline = None


def _get_ner(model_name: str = "dslim/bert-base-NER"):
    """Lazy-load the NER pipeline (downloads model on first call)."""
    global _ner_pipeline
    if _ner_pipeline is None and HAS_TRANSFORMERS:
        _ner_pipeline = hf_pipeline(
            "ner",
            model=model_name,
            aggregation_strategy="simple",
            device=-1,  # CPU
        )
    return _ner_pipeline


# ---------------------------------------------------------------------------
# Detection functions
# ---------------------------------------------------------------------------

def detect_with_regex(text: str) -> List[PIIEntity]:
    entities: List[PIIEntity] = []
    for label, pattern in _COMPILED.items():
        for match in pattern.finditer(text):
            entities.append(PIIEntity(
                text=match.group(),
                label=label,
                start=match.start(),
                end=match.end(),
                score=1.0,
                source="regex",
            ))
    return entities


def detect_with_ner(
    text: str,
    threshold: float = 0.85,
    model_name: str = "dslim/bert-base-NER",
) -> List[PIIEntity]:
    ner = _get_ner(model_name)
    if ner is None:
        return []

    # NER models have token limits; chunk long text
    chunk_size = 400
    words = text.split()
    chunks = [
        " ".join(words[i : i + chunk_size])
        for i in range(0, len(words), chunk_size)
    ]

    entities: List[PIIEntity] = []
    offset = 0
    for chunk in chunks:
        results = ner(chunk)
        for r in results:
            if r["score"] >= threshold:
                entities.append(PIIEntity(
                    text=r["word"],
                    label=r["entity_group"],  # PER, ORG, LOC, MISC
                    start=r["start"] + offset,
                    end=r["end"] + offset,
                    score=float(r["score"]),
                    source="ner",
                ))
        offset += len(chunk) + 1  # +1 for the space separator

    return entities


def deduplicate(entities: List[PIIEntity]) -> List[PIIEntity]:
    """
    Remove overlapping spans.
    When spans overlap, keep the one with the best score, priority, and length:
    1. Higher confidence score wins
    2. If tied on score, higher priority pattern wins
    3. If tied on both, longer match wins (more specific/informative)
    """
    if not entities:
        return []
    
    # Pattern specificity priority (higher = more specific)
    priority: dict[str, int] = {
        "AADHAAR": 100,
        "PAN": 100,
        "PASSPORT_IN": 100,
        "IFSC": 100,
        "CREDIT_CARD": 95,
        "SSN": 95,
        "DATE_OF_BIRTH": 90,
        "PHONE_IN": 85,
        "PHONE_INTL": 80,
        "EMAIL": 75,
        "IPV4": 50,
        "URL": 40,
        "PER": 30,
        "ORG": 20,
        "LOC": 20,
        "MISC": 10,
    }
    
    # Sort by start position first
    entities.sort(key=lambda e: e.start)
    
    result: List[PIIEntity] = []
    i = 0
    
    while i < len(entities):
        # Find all entities that start at the same position
        current_start = entities[i].start
        group = [entities[i]]
        j = i + 1
        
        while j < len(entities) and entities[j].start == current_start:
            group.append(entities[j])
            j += 1
        
        # Among this group, pick the best one by score, then match length, then priority
        # Longer matches are generally more specific/accurate (full CC vs partial Aadhaar)
        best = max(
            group,
            key=lambda e: (e.score, e.end - e.start, priority.get(e.label, 0))
        )
        
        # Check if best overlaps with the last entity in result
        if result and best.start < result[-1].end:
            # Overlaps with last result - compare them
            last = result[-1]
            # If new entity is better, replace the old one
            if (best.score, best.end - best.start, priority.get(best.label, 0)) > \
               (last.score, last.end - last.start, priority.get(last.label, 0)):
                result[-1] = best
        else:
            # No overlap, add it
            result.append(best)
        
        i = j
    
    return result


def detect_pii(
    text: str,
    use_ner: bool = True,
    ner_threshold: float = 0.85,
    model_name: str = "dslim/bert-base-NER",
) -> List[PIIEntity]:
    """
    Main entry point. Returns a deduplicated list of PII entities.

    Args:
        text: Input text to scan.
        use_ner: Whether to run the transformer NER model.
        ner_threshold: Minimum confidence score for NER results.
        model_name: HuggingFace model ID to use for NER.
    """
    regex_hits = detect_with_regex(text)
    ner_hits = detect_with_ner(text, ner_threshold, model_name) if use_ner else []
    return deduplicate(regex_hits + ner_hits)
