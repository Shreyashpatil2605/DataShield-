"""
PII Guard — unit tests
Run with: pytest tests/ -v
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core.pii_detector import detect_with_regex, deduplicate, PIIEntity
from core.redactor import redact_text, RedactionMode
from core.risk_engine import compute_risk_score
from core.context_classifier import classify
from core.explanatory_engine import explain


# ---------------------------------------------------------------------------
# Regex detection
# ---------------------------------------------------------------------------

def test_email_detected():
    text = "Contact us at support@example.com for help."
    entities = detect_with_regex(text)
    labels = [e.label for e in entities]
    assert "EMAIL" in labels

def test_aadhaar_detected():
    text = "My Aadhaar number is 2345 6789 0123."
    entities = detect_with_regex(text)
    labels = [e.label for e in entities]
    assert "AADHAAR" in labels

def test_pan_detected():
    text = "PAN card: ABCDE1234F"
    entities = detect_with_regex(text)
    labels = [e.label for e in entities]
    assert "PAN" in labels

def test_phone_in_detected():
    text = "Call me on 9876543210."
    entities = detect_with_regex(text)
    labels = [e.label for e in entities]
    assert "PHONE_IN" in labels

def test_credit_card_detected():
    text = "Card number: 4111 1111 1111 1111"
    entities = detect_with_regex(text)
    labels = [e.label for e in entities]
    assert "CREDIT_CARD" in labels

def test_no_false_positive_on_clean_text():
    text = "The weather in Mumbai is warm and sunny today."
    entities = detect_with_regex(text)
    assert len(entities) == 0


# ---------------------------------------------------------------------------
# Deduplication
# ---------------------------------------------------------------------------

def test_deduplicate_removes_overlap():
    e1 = PIIEntity("9876543210", "PHONE_IN",  0, 10, 1.0, "regex")
    e2 = PIIEntity("987654321",  "PHONE_INTL", 0,  9, 0.9, "regex")
    result = deduplicate([e1, e2])
    assert len(result) == 1
    assert result[0].label == "PHONE_IN"  # higher score wins


# ---------------------------------------------------------------------------
# Redaction
# ---------------------------------------------------------------------------

SAMPLE = "My email is user@test.com and Aadhaar is 2345 6789 0123."

def test_replace_mode():
    from core.pii_detector import detect_pii
    entities = detect_with_regex(SAMPLE)
    redacted, _ = redact_text(SAMPLE, entities, RedactionMode.REPLACE)
    assert "user@test.com" not in redacted
    assert "[EMAIL]" in redacted

def test_mask_mode():
    from core.pii_detector import detect_pii
    entities = detect_with_regex(SAMPLE)
    redacted, _ = redact_text(SAMPLE, entities, RedactionMode.MASK)
    assert "user@test.com" not in redacted
    assert "*" in redacted

def test_hash_mode_produces_hex():
    entities = detect_with_regex(SAMPLE)
    redacted, audit = redact_text(SAMPLE, entities, RedactionMode.HASH)
    assert "user@test.com" not in redacted
    # Hash replacements look like [LABEL:xxxxxxxx]
    assert any(len(a["replacement"]) > 8 for a in audit)

def test_synthetic_mode():
    entities = detect_with_regex(SAMPLE)
    redacted, _ = redact_text(SAMPLE, entities, RedactionMode.SYNTHETIC)
    assert "user@test.com" not in redacted
    assert "example.com" in redacted

def test_audit_log_length_matches_entities():
    entities = detect_with_regex(SAMPLE)
    _, audit = redact_text(SAMPLE, entities, RedactionMode.REPLACE)
    assert len(audit) == len(entities)


# ---------------------------------------------------------------------------
# Risk scoring
# ---------------------------------------------------------------------------

def test_empty_entities_returns_safe():
    result = compute_risk_score([])
    assert result["score"] == 0
    assert result["level"] == "safe"
    assert result["allowed"] is True

def test_aadhaar_gives_high_score():
    entities = [PIIEntity("2345 6789 0123", "AADHAAR", 0, 14, 1.0, "regex")]
    result = compute_risk_score(entities)
    assert result["score"] > 0
    assert result["level"] in ("medium", "high", "critical")

def test_critical_combo_blocked():
    entities = [
        PIIEntity("2345 6789 0123", "AADHAAR",     0, 14, 1.0, "regex"),
        PIIEntity("ABCDE1234F",     "PAN",         20, 30, 1.0, "regex"),
        PIIEntity("4111111111111111","CREDIT_CARD", 35, 51, 1.0, "regex"),
    ]
    result = compute_risk_score(entities)
    assert result["score"] >= 65


# ---------------------------------------------------------------------------
# Context classifier
# ---------------------------------------------------------------------------

def test_clean_text_allowed():
    decision = classify([])
    assert decision["allowed"] is True

def test_aadhaar_pan_combo_blocked():
    entities = [
        PIIEntity("2345 6789 0123", "AADHAAR", 0, 14, 1.0, "regex"),
        PIIEntity("ABCDE1234F",     "PAN",     20, 30, 1.0, "regex"),
    ]
    decision = classify(entities)
    assert decision["allowed"] is False
    assert decision["rule_fired"] is not None

def test_allow_override_bypasses_block():
    entities = [
        PIIEntity("2345 6789 0123", "AADHAAR", 0, 14, 1.0, "regex"),
        PIIEntity("ABCDE1234F",     "PAN",     20, 30, 1.0, "regex"),
    ]
    decision = classify(entities, allow_override=True)
    # Override removes hard block; allowed depends only on risk score now
    assert "rule_fired" not in decision or decision["rule_fired"] is None


# ---------------------------------------------------------------------------
# Explanations
# ---------------------------------------------------------------------------

def test_explain_returns_sorted_by_severity():
    entities = [
        PIIEntity("John", "PER",     0,  4, 0.9, "ner"),
        PIIEntity("2345 6789 0123", "AADHAAR", 10, 24, 1.0, "regex"),
    ]
    explanations = explain(entities)
    assert explanations[0]["severity"] in ("critical", "high")

def test_explain_deduplicates_labels():
    entities = [
        PIIEntity("a@b.com", "EMAIL", 0, 7, 1.0, "regex"),
        PIIEntity("c@d.com", "EMAIL", 10, 17, 1.0, "regex"),
    ]
    explanations = explain(entities)
    email_entries = [e for e in explanations if e["label"] == "EMAIL"]
    assert len(email_entries) == 1
