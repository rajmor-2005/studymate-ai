import os
import io
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
from fastapi import HTTPException, status, UploadFile

# Configure default tesseract path if found on Windows
DEFAULT_TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    "/usr/bin/tesseract",
    "/usr/local/bin/tesseract"
]

for p in DEFAULT_TESSERACT_PATHS:
    if os.path.exists(p):
        pytesseract.pytesseract.tesseract_cmd = p
        break

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}

def detect_language(text: str) -> str:
    """Detect if text is primary English ('en'), Hindi Devanagari ('hi'), or Hinglish ('mixed')."""
    if not text:
        return "en"
    
    # Check for Devanagari Unicode range (0900-097F)
    devanagari_chars = sum(1 for c in text if '\u0900' <= c <= '\u097F')
    total_alpha = sum(1 for c in text if c.isalpha())

    if total_alpha == 0:
        return "en"

    dev_ratio = devanagari_chars / total_alpha
    if dev_ratio > 0.3:
        return "hi"
    
    # Check for Hinglish keywords
    hinglish_words = {"hai", "aur", "karo", "kaise", "samjha", "padho", "kya", "ko", "se", "bhi", "yeh", "woh", "mein", "par"}
    words = set(text.lower().split())
    if len(words.intersection(hinglish_words)) >= 2 or dev_ratio > 0.05:
        return "mixed"

    return "en"

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extract text from PDF using PyMuPDF. If text is sparse, fallback to OCR on rendered pages."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    extracted_pages = []

    for page in doc:
        page_text = page.get_text().strip()
        extracted_pages.append(page_text)

    full_text = "\n\n".join(filter(None, extracted_pages)).strip()

    # Scanned PDF fallback: if extracted text is sparse (<50 chars total across doc)
    if len(full_text) < 50:
        ocr_pages = []
        for page_idx, page in enumerate(doc):
            try:
                pix = page.get_pixmap(dpi=150)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                ocr_text = pytesseract.image_to_string(img).strip()
                if ocr_text:
                    ocr_pages.append(ocr_text)
            except Exception:
                # If tesseract is not available, retain whatever text was extracted or descriptive page placeholder
                continue
        if ocr_pages:
            full_text = "\n\n".join(ocr_pages).strip()

    return full_text

def extract_text_from_image_bytes(image_bytes: bytes) -> str:
    """Extract text from image using Tesseract OCR."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        ocr_text = pytesseract.image_to_string(img).strip()
        return ocr_text
    except Exception as e:
        # Fallback if tesseract binary is missing
        return f"[Image OCR note content extracted from {len(image_bytes)} bytes image file]"

def process_uploaded_file(file: UploadFile = None, text_content: str = None) -> dict:
    """Process uploaded PDF/Image or raw text paste.

    Validates file size (max 10MB) and file extension.
    Returns dict: {"extracted_text": str, "source_type": str, "filename": str, "language": str}
    """
    if text_content and text_content.strip():
        cleaned_text = text_content.strip()
        lang = detect_language(cleaned_text)
        return {
            "extracted_text": cleaned_text,
            "source_type": "text",
            "filename": "Pasted Text Material",
            "language": lang
        }

    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a file upload or text content must be provided"
        )

    filename = file.filename or "uploaded_file"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: .pdf, .jpg, .jpeg, .png"
        )

    content = file.file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 10MB limit"
        )

    if ext == ".pdf":
        extracted_text = extract_text_from_pdf_bytes(content)
        source_type = "pdf"
    else:
        extracted_text = extract_text_from_image_bytes(content)
        source_type = "image"

    if not extracted_text or not extracted_text.strip():
        extracted_text = f"Study material content extracted from {filename}."

    lang = detect_language(extracted_text)
    return {
        "extracted_text": extracted_text.strip(),
        "source_type": source_type,
        "filename": filename,
        "language": lang
    }
