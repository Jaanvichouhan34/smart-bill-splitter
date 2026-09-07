import logging
from typing import Set
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import BillExtraction, ErrorResponse, CalculationRequest, CalculationResult
from services.extraction import extraction_service
from services.calculation import calculate_split

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("digivalet_api")

app = FastAPI(
    title="DigiValet - Bill Splitting Vision API",
    description="Backend service for extracting validated structured bill & receipt items using Vision LLMs.",
    version="1.0.0"
)

# CORS Configuration allowing local frontend dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_MIME_TYPES: Set[str] = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/bmp",
    "image/tiff"
}


@app.get("/", tags=["General"])
async def root():
    return {
        "name": "DigiValet - Bill Splitting API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "configured_provider": extraction_service.preferred_provider,
        "is_configured": extraction_service.is_configured()
    }


@app.get("/health", tags=["General"])
async def health_check():
    return {
        "status": "healthy",
        "gemini_configured": bool(extraction_service.gemini_api_key),
        "groq_configured": bool(extraction_service.groq_api_key),
        "provider": extraction_service.preferred_provider
    }


@app.post(
    "/extract-bill",
    response_model=BillExtraction,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid file format or missing file"},
        422: {"model": ErrorResponse, "description": "Unprocessable image or extraction parsing error"},
        500: {"model": ErrorResponse, "description": "Server or Vision LLM service failure"},
    },
    tags=["Extraction"]
)
async def extract_bill(file: UploadFile = File(...)):
    """
    Accept an uploaded bill/receipt image and extract structured items and pricing details.
    """
    # 1. Validate file presence
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided. Please upload a receipt image."
        )

    # 2. Validate MIME type
    content_type = file.content_type.lower() if file.content_type else ""
    
    # Check extension fallback if content_type is generic
    if content_type not in SUPPORTED_MIME_TYPES:
        filename = file.filename.lower()
        if filename.endswith((".jpg", ".jpeg")):
            content_type = "image/jpeg"
        elif filename.endswith(".png"):
            content_type = "image/png"
        elif filename.endswith(".webp"):
            content_type = "image/webp"
        elif filename.endswith((".heic", ".heif")):
            content_type = "image/heic"
        elif filename.endswith(".bmp"):
            content_type = "image/bmp"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '{file.content_type}'. Please upload an image (JPEG, PNG, WEBP, HEIC, BMP)."
            )

    # 3. Read image contents
    try:
        image_bytes = await file.read()
    except Exception as e:
        logger.error(f"Failed to read uploaded file: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not read uploaded image data: {str(e)}"
        )

    if not image_bytes or len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)."
        )

    # Check maximum file size (e.g. 20MB)
    max_size_bytes = 20 * 1024 * 1024
    if len(image_bytes) > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit of 20MB."
        )

    # 4. Perform extraction with Vision LLM
    try:
        logger.info(f"Extracting bill from file '{file.filename}' ({len(image_bytes)} bytes, {content_type})")
        extraction_result = await extraction_service.extract_bill(
            image_bytes=image_bytes,
            mime_type=content_type
        )
        return extraction_result

    except ValueError as ve:
        logger.warning(f"Validation / Configuration error during extraction: {ve}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except RuntimeError as re_err:
        logger.error(f"Runtime error during Vision extraction: {re_err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(re_err)
        )
    except Exception as ex:
        logger.exception(f"Unexpected error in /extract-bill: {ex}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during bill processing: {str(ex)}"
        )


@app.post(
    "/calculate-split",
    response_model=CalculationResult,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid or empty request"},
        422: {"model": ErrorResponse, "description": "Calculation logic error"},
        500: {"model": ErrorResponse, "description": "Unexpected server error"},
    },
    tags=["Calculation"],
    summary="Phase 4 – Calculate proportional bill split with penny reconciliation",
)
async def calculate_split_endpoint(request: CalculationRequest):
    """
    Accept a reviewed bill + item assignments and return per-person breakdowns.

    The engine performs:
    1. Per-item proportional split
    2. Proportional distribution of tax, service charge, tip, and discount
    3. Penny-rounding reconciliation (zero-discrepancy invariant)
    """
    if not request.people:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="'people' list must contain at least one person."
        )

    try:
        logger.info(
            f"Calculating split: {len(request.people)} people, "
            f"{len(request.bill.items)} items, grand_total={request.bill.grand_total}"
        )
        result = calculate_split(request)
        return result

    except ValueError as ve:
        logger.warning(f"Validation error in /calculate-split: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except AssertionError as ae:
        logger.error(f"Invariant violation in /calculate-split: {ae}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ae)
        )
    except Exception as ex:
        logger.exception(f"Unexpected error in /calculate-split: {ex}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error during bill split calculation: {str(ex)}"
        )


@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main.py:app", host="127.0.0.1", port=8000, reload=True)
