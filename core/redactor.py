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


def mask_text_value(original: str, label: str) -> str:
    """
    Apply smart masking depending on the PII type.
    - Emails: keep domain and first 2 characters of username.
    - Phones: keep first 2 and last 2 digits.
    - Credit cards: keep first 4 and last 4.
    - Aadhaar: keep last 4.
    - PAN/Passport/SSN/IFSC: keep last 4 alphanumeric chars.
    - DOB: keep year digits.
    - Names/Locations/Orgs: keep first letter of each word.
    """
    if not original:
        return original
        
    label_upper = label.upper()
    
    if label_upper == "EMAIL" and "@" in original:
        parts = original.split("@", 1)
        local = parts[0]
        domain = parts[1]
        if len(local) <= 2:
            masked_local = "*" * len(local)
        else:
            masked_local = local[:2] + "*" * (len(local) - 2)
        return f"{masked_local}@{domain}"
        
    elif label_upper in ("PHONE_IN", "PHONE_INTL"):
        digits = [c for c in original if c.isdigit()]
        if len(digits) <= 4:
            return "".join("*" if c.isdigit() else c for c in original)
        digit_count = 0
        total_digits = len(digits)
        result = []
        for c in original:
            if c.isdigit():
                digit_count += 1
                if digit_count <= 2 or digit_count > total_digits - 2:
                    result.append(c)
                else:
                    result.append("*")
            else:
                result.append(c)
        return "".join(result)
        
    elif label_upper == "CREDIT_CARD":
        digits = [c for c in original if c.isdigit()]
        if len(digits) <= 8:
            return "".join("*" if c.isdigit() else c for c in original)
        digit_count = 0
        total_digits = len(digits)
        result = []
        for c in original:
            if c.isdigit():
                digit_count += 1
                if digit_count <= 4 or digit_count > total_digits - 4:
                    result.append(c)
                else:
                    result.append("*")
            else:
                result.append(c)
        return "".join(result)
        
    elif label_upper == "AADHAAR":
        digits = [c for c in original if c.isdigit()]
        if len(digits) <= 4:
            return "".join("*" if c.isdigit() else c for c in original)
        digit_count = 0
        total_digits = len(digits)
        result = []
        for c in original:
            if c.isdigit():
                digit_count += 1
                if digit_count > total_digits - 4:
                    result.append(c)
                else:
                    result.append("*")
            else:
                result.append(c)
        return "".join(result)
        
    elif label_upper in ("PAN", "PASSPORT_IN", "SSN", "IFSC"):
        length = len(original)
        keep_count = 4 if length > 6 else (2 if length > 3 else 0)
        if keep_count == 0:
            return "*" * length
        result = []
        alphanum_chars = [c for c in original if c.isalnum()]
        total_alphanum = len(alphanum_chars)
        alphanum_count = 0
        for c in original:
            if c.isalnum():
                alphanum_count += 1
                if alphanum_count > total_alphanum - keep_count:
                    result.append(c)
                else:
                    result.append("*")
            else:
                result.append(c)
        return "".join(result)
        
    elif label_upper == "DATE_OF_BIRTH":
        digits = [c for c in original if c.isdigit()]
        if len(digits) < 4:
            return "".join("*" if c.isdigit() else c for c in original)
        total_digits = len(digits)
        digit_count = 0
        result = []
        for c in original:
            if c.isdigit():
                digit_count += 1
                if digit_count > total_digits - 4:
                    result.append(c)
                else:
                    result.append("*")
            else:
                result.append(c)
        return "".join(result)
        
    elif label_upper in ("PER", "PERSON", "ORG", "LOC"):
        words = original.split(" ")
        masked_words = []
        for w in words:
            if not w:
                masked_words.append("")
                continue
            first_idx = -1
            for idx, char in enumerate(w):
                if char.isalnum():
                    first_idx = idx
                    break
            if first_idx == -1:
                masked_words.append("*" * len(w))
            else:
                masked_word = list(w)
                for idx in range(first_idx + 1, len(w)):
                    if w[idx].isalnum():
                        masked_word[idx] = "*"
                masked_words.append("".join(masked_word))
        return " ".join(masked_words)
        
    return "*" * len(original)


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
        return mask_text_value(original, label)
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
