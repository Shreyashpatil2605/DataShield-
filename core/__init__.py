"""PII Guard — core processing modules."""

from .ocr_engine import extract_text
from .pii_detector import detect_pii, PIIEntity
from .redactor import redact_text, RedactionMode
from .risk_engine import compute_risk_score
from .context_classifier import classify
from .explanatory_engine import explain

__all__ = [
    "extract_text",
    "detect_pii",
    "PIIEntity",
    "redact_text",
    "RedactionMode",
    "compute_risk_score",
    "classify",
    "explain",
]
