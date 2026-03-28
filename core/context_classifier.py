"""
Context Classifier — decides whether an upload should be allowed or blocked.

Decision logic:
  1. Compute risk score.
  2. Apply label-specific overrides (e.g., always block Aadhaar + PAN combo).
  3. Return allow/block with explanation.
"""

from typing import List
from .pii_detector import PIIEntity
from .risk_engine import compute_risk_score


# Combinations that trigger an immediate block regardless of total score
CRITICAL_COMBOS: List[frozenset] = [
    frozenset({"AADHAAR", "PAN"}),
    frozenset({"AADHAAR", "CREDIT_CARD"}),
    frozenset({"SSN", "CREDIT_CARD"}),
    frozenset({"PASSPORT_IN", "DATE_OF_BIRTH"}),
]

# Single labels that are always blocked unless the caller overrides
ALWAYS_BLOCK_LABELS: set = {"AADHAAR", "PAN", "SSN", "CREDIT_CARD"}


def classify(
    entities: List[PIIEntity],
    allow_override: bool = False,
) -> dict:
    """
    Returns:
        allowed    : bool
        risk       : dict (from risk_engine)
        reasons    : List[str]  human-readable explanation lines
        rule_fired : str | None  which hard rule blocked the upload (if any)
    """
    risk = compute_risk_score(entities)
    labels_found = {e.label for e in entities}
    reasons: List[str] = []
    rule_fired = None

    # --- Hard rules ---
    if not allow_override:
        for combo in CRITICAL_COMBOS:
            if combo.issubset(labels_found):
                names = " + ".join(sorted(combo))
                rule_fired = f"combo:{names}"
                reasons.append(
                    f"Blocked: dangerous combination of {names} detected. "
                    "Together these can enable identity theft."
                )
                break

        if rule_fired is None:
            blocked_labels = labels_found & ALWAYS_BLOCK_LABELS
            if blocked_labels:
                rule_fired = f"label:{','.join(sorted(blocked_labels))}"
                reasons.append(
                    f"Blocked: high-sensitivity identifiers detected "
                    f"({', '.join(sorted(blocked_labels))}). "
                    "These require explicit consent before sharing."
                )

    allowed = (rule_fired is None) and risk["allowed"]

    if allowed:
        if risk["level"] == "safe":
            reasons.append("No significant PII found. Upload permitted.")
        else:
            reasons.append(
                f"Risk level is {risk['level']} (score {risk['score']}/100). "
                "Review the detected entities before proceeding."
            )
    elif rule_fired is None and not risk["allowed"]:
        reasons.append(
            f"Risk score {risk['score']}/100 ({risk['level']}) exceeds threshold. "
            "Redact PII before uploading."
        )

    return {
        "allowed":    allowed,
        "risk":       risk,
        "reasons":    reasons,
        "rule_fired": rule_fired,
    }
