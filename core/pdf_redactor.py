"""
PDF Redactor — applies visual redactions to PDF files using PyMuPDF.

Instead of returning plain text, this module blacks out PII directly
in the original PDF layout, preserving formatting and structure.
"""

import os
import tempfile
from pathlib import Path
from typing import List, Optional

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False

from .pii_detector import PIIEntity
from .redactor import RedactionMode, _replacement
import logging

logger = logging.getLogger(__name__)


# Redaction fill color: solid black
REDACT_FILL = (0, 0, 0)

# Label background colors for annotated mode (RGB 0-1 scale)
LABEL_COLORS: dict[str, tuple] = {
    "AADHAAR":       (0.85, 0.10, 0.10),   # Red
    "PAN":           (0.85, 0.10, 0.10),
    "CREDIT_CARD":   (0.85, 0.10, 0.10),
    "SSN":           (0.85, 0.10, 0.10),
    "PASSPORT_IN":   (0.90, 0.40, 0.10),   # Orange
    "EMAIL":         (0.10, 0.45, 0.82),   # Blue
    "PHONE_IN":      (0.10, 0.45, 0.82),
    "PHONE_INTL":    (0.10, 0.45, 0.82),
    "IFSC":          (0.55, 0.25, 0.78),   # Purple
    "DATE_OF_BIRTH": (0.55, 0.25, 0.78),
    "PER":           (0.15, 0.65, 0.35),   # Green
    "PERSON":        (0.15, 0.65, 0.35),
    "ORG":           (0.15, 0.65, 0.35),
    "LOC":           (0.15, 0.65, 0.35),
    "IPV4":          (0.40, 0.40, 0.40),   # Gray
    "URL":           (0.40, 0.40, 0.40),
}

DEFAULT_COLOR = (0.20, 0.20, 0.20)  # Dark gray fallback


def map_font_name(span_font: str) -> str:
    """
    Map the extracted font name from the PDF text span to one of the standard
    14 built-in PDF fonts in PyMuPDF to ensure compatibility and correct rendering.
    """
    font_lower = span_font.lower()
    
    # Check for Courier / Mono
    if "cour" in font_lower or "mono" in font_lower:
        if "bold" in font_lower and ("italic" in font_lower or "oblique" in font_lower):
            return "cobi"
        elif "bold" in font_lower:
            return "cobo"
        elif "italic" in font_lower or "oblique" in font_lower:
            return "coob"
        return "cour"
        
    # Check for Times / Serif
    if "times" in font_lower or "serif" in font_lower or "roman" in font_lower:
        if "bold" in font_lower and ("italic" in font_lower or "oblique" in font_lower):
            return "tibi"
        elif "bold" in font_lower:
            return "tibo"
        elif "italic" in font_lower or "oblique" in font_lower:
            return "tiit"
        return "times"
        
    # Default to Helvetica
    if "bold" in font_lower and ("italic" in font_lower or "oblique" in font_lower):
        return "hebi"
    elif "bold" in font_lower:
        return "hebo"
    elif "italic" in font_lower or "oblique" in font_lower:
        return "heob"
    return "helv"


def _search_and_redact_page(
    page,
    entity_text: str,
    label: str,
    replacement_text: str,
    mode: RedactionMode,
) -> int:
    """
    Search for `entity_text` on a page, add redaction annotations for
    every occurrence found, replacing it with `replacement_text` while
    matching the original style (font, size, color) where possible.
    """
    # Search for the text — returns list of fitz.Rect
    matches = page.search_for(entity_text, quads=False)
    count = 0

    for rect in matches:
        # Fallback values
        fontname = "helv"
        fontsize = max(6, int((rect.y1 - rect.y0) * 0.8))
        text_color = (0, 0, 0)
        
        # Try to extract the style of the text under the rect
        try:
            dict_data = page.get_text("dict", clip=rect)
            found_span = False
            for block in dict_data.get("blocks", []):
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        span_font = span.get("font", "")
                        span_size = span.get("size", 0)
                        span_color = span.get("color", None)
                        
                        if span_font:
                            fontname = map_font_name(span_font)
                        if span_size > 0:
                            fontsize = span_size
                        if span_color is not None:
                            text_color = fitz.sRGB_to_pdf(span_color)
                        found_span = True
                        break
                    if found_span:
                        break
                if found_span:
                    break
        except Exception as e:
            logger.warning(f"Error extracting text style for rect {rect}: {e}")

        # Heuristic for background color: if text is very light, assume dark background.
        # Otherwise use white as the background fill to completely hide the original text.
        if sum(text_color) > 2.7:
            fill_color = (0.1, 0.1, 0.1)
        else:
            fill_color = (1.0, 1.0, 1.0)

        page.add_redact_annot(
            rect,
            text=replacement_text,
            fontname=fontname,
            fontsize=fontsize,
            fill=fill_color,
            text_color=text_color,
        )
        count += 1

    return count


def redact_pdf(
    pdf_path: str,
    entities: List[PIIEntity],
    output_path: Optional[str] = None,
    mode: RedactionMode = RedactionMode.REPLACE,
) -> str:
    """
    Apply visual redactions to a PDF file while preserving the original layout and format.

    For each detected PII entity, searches the PDF pages for matching text
    and replaces it in-place with its redacted/masked version.

    Args:
        pdf_path:    Path to the source PDF file.
        entities:    List of PIIEntity objects to redact.
        output_path: Where to save the redacted PDF. If None,
                     a temp file is created.
        mode:        RedactionMode indicating the redaction strategy.

    Returns:
        Path to the redacted PDF file.

    Raises:
        RuntimeError: If PyMuPDF is not installed.
        ValueError:   If the input file is not a PDF.
    """
    if not HAS_PYMUPDF:
        raise RuntimeError("PyMuPDF (fitz) is required for PDF redaction.")

    ext = Path(pdf_path).suffix.lower()
    if ext != ".pdf":
        raise ValueError(f"Expected a PDF file, got '{ext}'")

    doc = fitz.open(pdf_path)
    total_redactions = 0

    # Deduplicate entity texts to avoid redundant searches
    # Group by unique (text) to get label and replacement value
    unique_entities: dict[str, tuple[str, str]] = {}
    for entity in sorted(entities, key=lambda e: len(e.text), reverse=True):
        text = entity.text.strip()
        if text and text not in unique_entities:
            replacement = _replacement(text, entity.label, mode)
            unique_entities[text] = (entity.label, replacement)

    # Apply redactions across all pages
    for page in doc:
        for entity_text, (label, replacement_text) in unique_entities.items():
            count = _search_and_redact_page(
                page,
                entity_text,
                label,
                replacement_text,
                mode,
            )
            total_redactions += count

        # Apply all pending redactions on this page
        # This permanently removes the original content under the redaction
        page.apply_redactions()

    # Determine output path
    if output_path is None:
        fd, output_path = tempfile.mkstemp(suffix="_redacted.pdf")
        os.close(fd)

    doc.save(output_path, garbage=4, deflate=True)
    doc.close()

    return output_path


def get_redaction_summary(
    pdf_path: str,
    entities: List[PIIEntity],
) -> dict:
    """
    Preview how many redactions would be applied without modifying the PDF.

    Returns a dict with per-page match counts and totals.
    """
    if not HAS_PYMUPDF:
        raise RuntimeError("PyMuPDF (fitz) is required for PDF redaction.")

    doc = fitz.open(pdf_path)

    unique_entities: dict[str, str] = {}
    for entity in entities:
        text = entity.text.strip()
        if text and text not in unique_entities:
            unique_entities[text] = entity.label

    page_summaries = []
    total = 0

    for page_num, page in enumerate(doc):
        page_count = 0
        for entity_text, label in unique_entities.items():
            matches = page.search_for(entity_text, quads=False)
            page_count += len(matches)
        page_summaries.append({
            "page": page_num + 1,
            "redactions": page_count,
        })
        total += page_count

    doc.close()

    return {
        "total_redactions": total,
        "pages": page_summaries,
        "entity_types": list(set(unique_entities.values())),
    }
