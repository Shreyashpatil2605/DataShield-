"""
OCR Engine — extracts text from images, PDFs, and plain text files.
Uses EasyOCR for images and PyMuPDF for PDFs (with OCR fallback).
"""

import os
import tempfile
from pathlib import Path

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False

try:
    import easyocr
    HAS_EASYOCR = True
except ImportError:
    HAS_EASYOCR = False

try:
    import pytesseract
    from PIL import Image
    HAS_TESSERACT = True
except ImportError:
    HAS_TESSERACT = False


_reader = None  # lazy-load EasyOCR reader (slow to initialise)


def _get_reader():
    global _reader
    if _reader is None and HAS_EASYOCR:
        _reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    return _reader


def extract_text_from_image(image_path: str) -> str:
    """Extract text from an image file using EasyOCR or Tesseract."""
    reader = _get_reader()
    if reader:
        results = reader.readtext(image_path, detail=0)
        return " ".join(results)
    elif HAS_TESSERACT:
        img = Image.open(image_path)
        return pytesseract.image_to_string(img)
    else:
        raise RuntimeError(
            "No OCR backend found. Install easyocr or pytesseract."
        )


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from PDF.
    - Tries native text extraction first (fast, no OCR needed).
    - Falls back to per-page OCR for scanned/image-only pages.
    """
    if not HAS_PYMUPDF:
        raise RuntimeError("PyMuPDF (fitz) is required for PDF support.")

    doc = fitz.open(pdf_path)
    pages_text = []

    for page in doc:
        text = page.get_text("text").strip()
        if len(text) < 50:  # likely a scanned page — use OCR
            pix = page.get_pixmap(dpi=200)
            with tempfile.NamedTemporaryFile(
                suffix=".png", delete=False
            ) as tmp:
                pix.save(tmp.name)
                try:
                    text = extract_text_from_image(tmp.name)
                finally:
                    os.unlink(tmp.name)
        pages_text.append(text)

    return "\n\n".join(pages_text)


def extract_text(file_path: str) -> str:
    """
    Unified entry point. Accepts .txt, .pdf, .png, .jpg, .jpeg, .bmp, .tiff.
    Raises ValueError for unsupported extensions.
    """
    ext = Path(file_path).suffix.lower()
    if ext in {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"}:
        return extract_text_from_image(file_path)
    elif ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext == ".txt":
        return Path(file_path).read_text(encoding="utf-8", errors="replace")
    else:
        raise ValueError(f"Unsupported file type: {ext}")
