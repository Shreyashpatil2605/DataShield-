"""
Risk Detection Engine — assigns a privacy risk score (0–100) based on
the types and counts of PII entities found.
"""

from typing import List
from .pii_detector import PIIEntity


# Sensitivity weight per entity label (0–100, where higher = more sensitive)
# Adjusted: critical identifiers get higher weights so a single one reaches "medium" risk
RISK_WEIGHTS: dict[str, int] = {
    "AADHAAR":       50,  # Highest: can enable full identity fraud
    "PAN":           45,  # Very high: tax fraud + financial impersonation
    "CREDIT_CARD":   45,  # Very high: direct financial loss possible
    "PASSPORT_IN":   40,  # High: international travel/identity fraud
    "SSN":           45,  # Very high: most exploited US identifier
    "DATE_OF_BIRTH": 25,  # Medium: useful as secondary identifier
    "PHONE_IN":      15,  # Low-medium: used for spam/phishing
    "PHONE_INTL":    12,  # Low: generic phone number
    "EMAIL":         15,  # Low-medium: primary contact, phishing risk
    "IFSC":          15,  # Low-medium: needs account number to be dangerous
    "PER":           10,  # Low: person name alone
    "PERSON":        10,  # Low: person name (NER variant)
    "ORG":           5,   # Very low: organization name
    "LOC":           3,   # Very low: location
    "IPV4":          5,   # Very low: IP address
    "URL":           3,   # Very low: URL
    "MISC":          3,   # Very low: miscellaneous
}

MAX_POSSIBLE_WEIGHT = 120  # Max for most dangerous scenario combinations

RISK_LEVELS = [
    (0,   19,  "safe",     "No significant PII detected."),
    (20,  39,  "low",      "Minor PII present; review before sharing."),
    (40,  64,  "medium",   "Sensitive PII detected; redaction recommended."),
    (65,  84,  "high",     "High-risk PII found; do not share without redaction."),
    (85, 100,  "critical", "Critical identifiers detected; upload blocked by default."),
]


def _score_to_level(score: int) -> tuple[str, str]:
    for lo, hi, level, message in RISK_LEVELS:
        if lo <= score <= hi:
            return level, message
    return "critical", "Risk level could not be determined."


def compute_risk_score(entities: List[PIIEntity]) -> dict:
    """
    Returns a dict with:
        score     : int 0–100
        level     : str ("safe" | "low" | "medium" | "high" | "critical")
        message   : str  human-readable summary
        breakdown : dict  label → cumulative weight
        allowed   : bool  whether upload should be permitted by default
    """
    if not entities:
        return {
            "score": 0,
            "level": "safe",
            "message": "No PII detected.",
            "breakdown": {},
            "allowed": True,
        }

    breakdown: dict[str, int] = {}
    raw_score = 0

    for entity in entities:
        weight = RISK_WEIGHTS.get(entity.label, 3)
        breakdown[entity.label] = breakdown.get(entity.label, 0) + weight
        raw_score += weight

    # Normalise: scale raw to 0–100 using a reasonable max weight (200)
    # This ensures: single AADHAAR ≈ 40-50 (medium), major combos ≈ 70+ (high)
    score = min(int((raw_score / MAX_POSSIBLE_WEIGHT) * 100), 100)
    level, message = _score_to_level(score)

    return {
        "score":     score,
        "level":     level,
        "message":   message,
        "breakdown": breakdown,
        "allowed":   level not in ("high", "critical"),
    }
