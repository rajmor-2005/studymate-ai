import pytest
import io
import fitz
from PIL import Image, ImageDraw, ImageFont
from fastapi import HTTPException, UploadFile
from backend.services.document_processor import (
    process_uploaded_file,
    detect_language,
    MAX_FILE_SIZE_BYTES
)

def create_sample_pdf_bytes(text_content: str) -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), text_content)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

def create_scanned_pdf_bytes() -> bytes:
    # Create an image with text rendered, then embed image in PDF (no text layer)
    img = Image.new("RGB", (400, 200), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((20, 20), "Scanned physics note content for test", fill=(0, 0, 0))
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="PNG")
    img_bytes = img_byte_arr.getvalue()

    doc = fitz.open()
    page = doc.new_page(width=400, height=200)
    page.insert_image(fitz.Rect(0, 0, 400, 200), stream=img_bytes)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

def create_sample_image_bytes() -> bytes:
    img = Image.new("RGB", (300, 100), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((10, 10), "Chemistry Organic Reactions Note", fill=(0, 0, 0))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="PNG")
    return img_byte_arr.getvalue()

# Test 1: Upload valid PDF with extractable text
def test_1_valid_pdf_extraction():
    pdf_bytes = create_sample_pdf_bytes("Newton's Laws of Motion state that an object remains at rest unless acted upon by a force.")
    upload_file = UploadFile(filename="physics_chapter1.pdf", file=io.BytesIO(pdf_bytes))
    
    res = process_uploaded_file(file=upload_file)
    assert res["source_type"] == "pdf"
    assert "Newton's Laws of Motion" in res["extracted_text"]
    assert res["language"] == "en"

# Test 2: Upload scanned/image-only PDF (falls back to OCR / scanned page handling)
def test_2_scanned_pdf_fallback():
    scanned_bytes = create_scanned_pdf_bytes()
    upload_file = UploadFile(filename="scanned_notes.pdf", file=io.BytesIO(scanned_bytes))
    
    res = process_uploaded_file(file=upload_file)
    assert res["source_type"] == "pdf"
    assert len(res["extracted_text"]) > 0

# Test 3: Upload image (photographed notes)
def test_3_image_ocr():
    img_bytes = create_sample_image_bytes()
    upload_file = UploadFile(filename="math_notes.png", file=io.BytesIO(img_bytes))
    
    res = process_uploaded_file(file=upload_file)
    assert res["source_type"] == "image"
    assert len(res["extracted_text"]) > 0

# Test 4: Upload file >10MB rejected
def test_4_file_size_exceeded():
    large_bytes = b"x" * (MAX_FILE_SIZE_BYTES + 1024)
    upload_file = UploadFile(filename="huge_book.pdf", file=io.BytesIO(large_bytes))
    
    with pytest.raises(HTTPException) as exc_info:
        process_uploaded_file(file=upload_file)
    assert exc_info.value.status_code == 400
    assert "exceeds 10MB limit" in exc_info.value.detail

# Test 5: Upload unsupported file type (.docx)
def test_5_unsupported_file_type():
    doc_bytes = b"dummy docx content"
    upload_file = UploadFile(filename="assignment.docx", file=io.BytesIO(doc_bytes))
    
    with pytest.raises(HTTPException) as exc_info:
        process_uploaded_file(file=upload_file)
    assert exc_info.value.status_code == 400
    assert "Unsupported file format" in exc_info.value.detail

# Test 6: Paste plain text directly
def test_6_paste_plain_text():
    pasted_text = "Yeh chapter Photosynthesis ke baare mein hai. Plants light absorption se energy banate hain."
    res = process_uploaded_file(text_content=pasted_text)
    
    assert res["source_type"] == "text"
    assert res["extracted_text"] == pasted_text
    assert res["language"] in ["hi", "mixed"]
