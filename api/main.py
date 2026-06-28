"""
PII Guard — FastAPI REST API
Run with: uvicorn api.main:app --reload --port 8000
Docs at:  http://localhost:8000/docs
"""

import os
import tempfile
import logging
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, Query, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse, FileResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core import (
    extract_text,
    detect_pii,
    redact_text,
    RedactionMode,
    classify,
    explain,
    redact_pdf,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="PII Guard API",
    description=(
        "Privacy-focused API that detects and redacts sensitive data "
        "(PII) from text, PDF, and image inputs."
    ),
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda request, exc: JSONResponse(
    status_code=429,
    content={"detail": "Rate limit exceeded. Max 30 requests per minute."},
))

# CORS configuration: restrict to localhost for development
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:3001,http://localhost:3000,http://localhost:5173,http://127.0.0.1:3001,http://127.0.0.1:3000,http://127.0.0.1:5173"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {
    ".txt", ".pdf", ".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tif", ".webp"
}
MAX_FILE_SIZE_MB = 20
MAX_TEXT_LENGTH = 100_000  # ~20KB of text


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "service": "pii-guard"}


REDACTED_FILES = {}


@app.post("/analyze", summary="Analyze a file for PII")
@limiter.limit("30/minute")
async def analyze(
    request: Request,
    file: UploadFile = File(..., description="Text, PDF, or image file"),
    mode: str = Query("replace", description="Redaction mode: replace | hash | mask | synthetic"),
):
    """
    Upload a file and receive:
    - Risk score & level
    - List of detected PII entities
    - Explanations for each entity type
    - Redacted version of the text
    - Allow/block decision
    - Audit log of all substitutions
    - For PDFs, a redacted file download ID
    """
    tmp_path = None
    try:
        logger.info(f"Analyze request: file={file.filename}, mode={mode}")
        
        # Validate filename
        if not file.filename:
            logger.warning("Upload attempt with no filename")
            raise HTTPException(status_code=400, detail="Filename is required")
        
        
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            logger.warning(f"Unsupported file type: {ext}")
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type '{ext}'. Allowed: {sorted(ALLOWED_EXTENSIONS)}",
            )

        content = await file.read()
        if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
            logger.warning(f"File too large: {len(content) / 1024 / 1024:.2f}MB")
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB} MB.",
            )

        # Create temp file with proper cleanup
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        text = extract_text(tmp_path)
        
        # Process PII detection
        entities = detect_pii(text, use_ner=True)
        
        # Convert mode string to RedactionMode enum
        try:
            mode_enum = RedactionMode(mode.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid mode '{mode}'. Valid: replace, hash, mask, synthetic"
            )
        
        redacted, audit = redact_text(text, entities, mode_enum)
        decision = classify(entities, allow_override=False)
        explanations = explain(entities)

        # In-place layout-preserving PDF Redaction/Masking
        redacted_pdf_id = None
        if ext == ".pdf":
            try:
                import uuid
                # Create a temporary file to save the redacted PDF
                fd, out_path = tempfile.mkstemp(suffix="_redacted.pdf")
                os.close(fd)
                
                # Perform the in-place PDF redaction preserving formatting
                redact_pdf(
                    pdf_path=tmp_path,
                    entities=entities,
                    output_path=out_path,
                    mode=mode_enum,
                )
                
                redacted_pdf_id = uuid.uuid4().hex
                REDACTED_FILES[redacted_pdf_id] = {
                    "path": out_path,
                    "filename": f"{Path(file.filename).stem}_redacted.pdf"
                }
                logger.info(f"Redacted PDF generated successfully: {out_path} (id={redacted_pdf_id})")
            except Exception as pdf_err:
                logger.error(f"Failed to redact PDF: {pdf_err}", exc_info=True)

        logger.info(f"Analysis complete: {file.filename} - {len(entities)} entities found")
        
        return {
            "filename":       file.filename,
            "decision":       decision,
            "entities_found": len(entities),
            "entities":       [e.to_dict() for e in entities],
            "explanations":   explanations,
            "redacted_text":  redacted,
            "audit_log":      audit,
            "redacted_pdf_id": redacted_pdf_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Analysis failed: " + str(e))
    finally:
        # Ensure temp file cleanup
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except Exception as e:
                logger.error(f"Failed to cleanup temp file {tmp_path}: {e}")


@app.get("/download/{file_id}", summary="Download redacted PDF file")
async def download_redacted_file(file_id: str, background_tasks: BackgroundTasks):
    """
    Download a previously generated redacted PDF file.
    The file is deleted from the server immediately after download.
    """
    file_info = REDACTED_FILES.get(file_id)
    if not file_info:
        logger.warning(f"Download requested for non-existent file_id: {file_id}")
        raise HTTPException(
            status_code=404,
            detail="File not found or link has expired."
        )
        
    file_path = file_info["path"]
    download_filename = file_info["filename"]
    
    if not os.path.exists(file_path):
        logger.warning(f"Redacted file missing from disk: {file_path}")
        raise HTTPException(
            status_code=404,
            detail="File not found on disk."
        )
        
    def remove_file(path: str):
        try:
            if os.path.exists(path):
                os.unlink(path)
                logger.info(f"Successfully cleaned up temporary redacted file: {path}")
        except Exception as e:
            logger.error(f"Error deleting temp file {path}: {e}")
            
    background_tasks.add_task(remove_file, file_path)
    # Remove from dict so it cannot be accessed again
    REDACTED_FILES.pop(file_id, None)
    
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=download_filename,
    )


@app.post("/analyze/text", summary="Analyze raw text for PII")
@limiter.limit("50/minute")
async def analyze_text(
    request: Request,
    text: str = Query(..., description="Plain text to analyze"),
    mode: str = Query("replace", description="Redaction mode: replace | hash | mask | synthetic"),
):
    """Analyze a raw text string (no file upload needed)."""
    # Input validation
    if not text or len(text) == 0:
        logger.warning("Empty text submitted")
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    if len(text) > MAX_TEXT_LENGTH:
        logger.warning(f"Text too long: {len(text)} characters")
        raise HTTPException(
            status_code=413,
            detail=f"Text too long. Maximum {MAX_TEXT_LENGTH} characters.",
        )
    
    try:
        logger.info(f"Text analysis request: {len(text)} chars, mode={mode}")
        
        entities = detect_pii(text, use_ner=True)
        
        # Convert mode string to RedactionMode enum
        try:
            mode_enum = RedactionMode(mode.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid mode '{mode}'. Valid: replace, hash, mask, synthetic"
            )
        
        redacted, audit = redact_text(text, entities, mode_enum)
        decision = classify(entities, allow_override=False)
        explanations = explain(entities)

        logger.info(f"Text analysis complete - {len(entities)} entities found")
        
        return {
            "decision":       decision,
            "entities_found": len(entities),
            "entities":       [e.to_dict() for e in entities],
            "explanations":   explanations,
            "redacted_text":  redacted,
            "audit_log":      audit,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Text analysis error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Analysis failed: " + str(e))


@app.get("/modes", summary="List available redaction modes")
def list_modes():
    return {
        "modes": [
            {"id": "replace",   "description": "Replace with [LABEL] placeholder"},
            {"id": "hash",      "description": "Replace with [LABEL:hash8] — reversible with salt"},
            {"id": "mask",      "description": "Replace with asterisks (*****)"},
            {"id": "synthetic", "description": "Replace with structurally valid fake data"},
        ]
    }


@app.get("/config")
def get_config():
    """Get current configuration and limits."""
    return {
        "max_file_size_mb": MAX_FILE_SIZE_MB,
        "max_text_length": MAX_TEXT_LENGTH,
        "supported_formats": sorted(ALLOWED_EXTENSIONS),
        "rate_limits": {
            "file_upload": "30 requests/min",
            "text_analysis": "50 requests/min",
        },
        "cors_origins": ALLOWED_ORIGINS,
    }


@app.on_event("startup")
async def startup_event():
    """Pre-load NER model on startup for faster first request."""
    logger.info("Starting PII Guard API...")
    try:
        # Pre-warm NER model to avoid first-request latency
        logger.info("Pre-loading NER model...")
        sample_text = "John Smith lives in New York."
        _ = detect_pii(sample_text, use_ner=True)
        logger.info("NER model pre-loaded successfully")
    except Exception as e:
        logger.warning(f"Could not pre-load NER model: {e}. Model will load on first request.")
    logger.info("PII Guard API ready!")


@app.on_event("shutdown")
def shutdown_event():
    """Log shutdown."""
    logger.info("Shutting down PII Guard API...")
