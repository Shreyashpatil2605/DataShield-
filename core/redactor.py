"""
Redactor — applies redaction/masking strategies to detected PII entities.

Modes:
  replace   → [EMAIL], [AADHAAR], etc.
  hash      → [EMAIL:a3f2b1c4]  (first 8 chars of SHA-256)
  mask      → ********
  synthetic → fake@example.com, XXXXX0000X, etc.
"""

import hashlib
from enum import Enum
from typing import List, Tuple
from .pii_detector import PIIEntity


class RedactionMode(str, Enum):
    REPLACE   = "replace"
    HASH      = "hash"
    MASK      = "mask"
    SYNTHETIC = "synthetic"


# Synthetic (fake but structurally valid) replacements
SYNTHETIC_MAP: dict[str, str] = {
    "EMAIL":         "user@example.com",
    "PHONE_IN":      "+91-9000000000",
    "PHONE_INTL":    "+1-800-000-0000",
    "AADHAAR":       "XXXX XXXX XXXX",
    "PAN":           "XXXXX0000X",
    "PASSPORT_IN":   "A0000000",
    "IFSC":          "XXXX0000000",
    "CREDIT_CARD":   "XXXX-XXXX-XXXX-XXXX",
    "SSN":           "XXX-XX-XXXX",
    "IPV4":          "0.0.0.0",
    "DATE_OF_BIRTH": "DOB: XX/XX/XXXX",
    "URL":           "https://example.com",
    "PER":           "John Doe",
    "PERSON":        "John Doe",
    "ORG":           "Example Org",
    "LOC":           "Example Location",
}


def _replacement(
    original: str,
    label: str,
    mode: RedactionMode,
) -> str:
    if mode == RedactionMode.REPLACE:
        return f"[{label}]"
    elif mode == RedactionMode.HASH:
        h = hashlib.sha256(original.encode()).hexdigest()[:8]
        return f"[{label}:{h}]"
    elif mode == RedactionMode.MASK:
        return "*" * len(original)
    elif mode == RedactionMode.SYNTHETIC:
        return SYNTHETIC_MAP.get(label, f"[{label}]")
    return f"[{label}]"


def redact_text(
    text: str,
    entities: List[PIIEntity],
    mode: RedactionMode = RedactionMode.REPLACE,
) -> Tuple[str, List[dict]]:
    """
    Redact detected PII from text.

    Processes entities right-to-left so character offsets remain valid
    as the string length changes during substitution.

    Returns:
        redacted_text: String with PII replaced.
        audit_log: List of records describing each substitution.
    """
    # Work on a mutable list of characters for efficient splicing
    chars = list(text)
    audit_log: List[dict] = []

    # Sort right-to-left (reverse by start position)
    for entity in sorted(entities, key=lambda e: e.start, reverse=True):
        original = text[entity.start : entity.end]
        replacement = _replacement(original, entity.label, mode)

        chars[entity.start : entity.end] = list(replacement)
        audit_log.append({
            "label":         entity.label,
            "original_hash": hashlib.sha256(original.encode()).hexdigest(),
            "replacement":   replacement,
            "start":         entity.start,
            "end":           entity.end,
            "source":        entity.source,
            "score":         round(entity.score, 4),
        })

    return "".join(chars), audit_log
