"""
Explanatory Engine — generates user-facing explanations for detected PII.

Explains what each entity type is, why it's sensitive, and what law/
regulation protects it. Designed to build user trust rather than just
showing raw labels.
"""

from typing import List
from .pii_detector import PIIEntity


EXPLANATIONS: dict[str, dict] = {
    "AADHAAR": {
        "what": "Aadhaar number",
        "why": (
            "A 12-digit unique identity number issued by UIDAI. "
            "Exposure enables identity fraud, financial fraud, and "
            "unauthorised access to government services."
        ),
        "law": "DPDPA 2023 (India), Aadhaar Act 2016",
        "severity": "critical",
    },
    "PAN": {
        "what": "PAN card number",
        "why": (
            "A 10-character alphanumeric permanent account number issued "
            "by the Income Tax Department. Exposure enables tax fraud and "
            "financial impersonation."
        ),
        "law": "DPDPA 2023 (India), Income Tax Act 1961",
        "severity": "high",
    },
    "CREDIT_CARD": {
        "what": "Credit/debit card number",
        "why": (
            "A 16-digit payment card identifier. Exposure can lead to "
            "unauthorised transactions and financial loss."
        ),
        "law": "PCI DSS, DPDPA 2023, GDPR",
        "severity": "critical",
    },
    "PASSPORT_IN": {
        "what": "Indian passport number",
        "why": (
            "A government-issued travel document identifier. Exposure "
            "enables identity fraud and can compromise international travel."
        ),
        "law": "DPDPA 2023, Passports Act 1967",
        "severity": "high",
    },
    "SSN": {
        "what": "Social Security Number (US)",
        "why": (
            "A 9-digit US government identifier. One of the most exploited "
            "identifiers for identity theft."
        ),
        "law": "US Privacy Act, GDPR (if EU citizen)",
        "severity": "critical",
    },
    "DATE_OF_BIRTH": {
        "what": "Date of birth",
        "why": (
            "Combined with other identifiers, date of birth is used in "
            "identity verification and fraud."
        ),
        "law": "DPDPA 2023, GDPR",
        "severity": "medium",
    },
    "PHONE_IN": {
        "what": "Indian phone number",
        "why": "Can be used for spam, phishing calls, or SIM-swap attacks.",
        "law": "DPDPA 2023, TRAI regulations",
        "severity": "medium",
    },
    "PHONE_INTL": {
        "what": "International phone number",
        "why": "Can be used for spam, phishing, or account takeover.",
        "law": "GDPR, DPDPA 2023",
        "severity": "medium",
    },
    "EMAIL": {
        "what": "Email address",
        "why": (
            "A primary contact identifier. Exposure enables phishing, "
            "spam, and credential-stuffing attacks."
        ),
        "law": "DPDPA 2023, GDPR, CAN-SPAM",
        "severity": "medium",
    },
    "IFSC": {
        "what": "IFSC code",
        "why": (
            "Bank branch identifier. Combined with an account number it "
            "enables unauthorised fund transfers."
        ),
        "law": "DPDPA 2023, RBI guidelines",
        "severity": "medium",
    },
    "PER": {
        "what": "Person's name",
        "why": (
            "Names alone are low risk but become high risk when combined "
            "with other identifiers."
        ),
        "law": "DPDPA 2023, GDPR",
        "severity": "low",
    },
    "PERSON": {
        "what": "Person's name",
        "why": "See above.",
        "law": "DPDPA 2023, GDPR",
        "severity": "low",
    },
    "ORG": {
        "what": "Organisation name",
        "why": "Generally low sensitivity unless linked to health or legal data.",
        "law": "DPDPA 2023",
        "severity": "low",
    },
    "LOC": {
        "what": "Location / address",
        "why": "Home or workplace addresses can enable physical harm or stalking.",
        "law": "DPDPA 2023, GDPR",
        "severity": "low",
    },
    "IPV4": {
        "what": "IP address",
        "why": "Can reveal user location and identity when combined with logs.",
        "law": "GDPR (classified as personal data)",
        "severity": "low",
    },
}

_DEFAULT = {
    "what": "Sensitive data",
    "why": "This field may contain personal or confidential information.",
    "law": "DPDPA 2023 / GDPR",
    "severity": "medium",
}


def explain(entities: List[PIIEntity]) -> List[dict]:
    """
    Return one explanation record per unique entity label found.
    """
    seen: set = set()
    explanations: List[dict] = []

    for entity in entities:
        if entity.label in seen:
            continue
        seen.add(entity.label)
        info = EXPLANATIONS.get(entity.label, _DEFAULT)
        explanations.append({
            "label":    entity.label,
            "what":     info["what"],
            "why":      info["why"],
            "law":      info["law"],
            "severity": info["severity"],
        })

    # Sort by severity: critical → high → medium → low
    order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    explanations.sort(key=lambda x: order.get(x["severity"], 4))
    return explanations
