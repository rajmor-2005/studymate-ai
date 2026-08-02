import pytest
import io
import json
import uuid
from datetime import date, timedelta
import fitz
from PIL import Image, ImageDraw
from fastapi import HTTPException, UploadFile
from fastapi.testclient import TestClient

from backend.main import app
from backend.core.database import SessionLocal, Base, engine
from backend.models.user import User
from backend.models.payment import UploadUsage, Payment
from backend.services.document_processor import (
    process_uploaded_file,
    MAX_FILE_SIZE_BYTES
)
from backend.services.rag_service import (
    index_document,
    query_document,
    delete_document_index
)
from backend.services.llm_service import (
    generate_summary,
    generate_mcqs,
    generate_flashcards,
    generate_chat_response
)

client = TestClient(app)

# Helper functions for mock data creation
def create_pdf_bytes(text: str) -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), text)
    b = doc.tobytes()
    doc.close()
    return b

def create_scanned_pdf() -> bytes:
    img = Image.new("RGB", (400, 200), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((20, 20), "Scanned physics note content for test", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    doc = fitz.open()
    page = doc.new_page(width=400, height=200)
    page.insert_image(fitz.Rect(0, 0, 400, 200), stream=buf.getvalue())
    b = doc.tobytes()
    doc.close()
    return b

def create_image_bytes() -> bytes:
    img = Image.new("RGB", (300, 100), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((10, 10), "Chemistry Organic Reactions Note", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def create_user(prefix: str = "user", tier: str = "free") -> tuple[dict, str, str]:
    unique_email = f"{prefix}_{uuid.uuid4().hex[:8]}@example.com"
    payload = {"email": unique_email, "password": "Password123!", "name": f"User {prefix}"}
    res = client.post("/api/auth/signup", json=payload)
    data = res.json()
    token = data["access_token"]
    user_id = data["user"]["id"]
    if tier == "pro":
        db = SessionLocal()
        u = db.query(User).filter(User.id == user_id).first()
        u.subscription_tier = "pro"
        db.commit()
        db.close()
    return payload, token, user_id


# ==============================================================================
# SECTION 2.1: DOCUMENT PROCESSING (TESTS 1-6)
# ==============================================================================

def test_01_upload_valid_pdf():
    pdf_b = create_pdf_bytes("Newton's Laws of Motion state that an object remains at rest unless acted upon by force.")
    file_obj = UploadFile(filename="physics.pdf", file=io.BytesIO(pdf_b))
    res = process_uploaded_file(file=file_obj)
    assert res["source_type"] == "pdf"
    assert "Newton's Laws of Motion" in res["extracted_text"]

def test_02_upload_scanned_pdf():
    pdf_b = create_scanned_pdf()
    file_obj = UploadFile(filename="scanned.pdf", file=io.BytesIO(pdf_b))
    res = process_uploaded_file(file=file_obj)
    assert res["source_type"] == "pdf"
    assert len(res["extracted_text"]) > 0

def test_03_upload_image_notes():
    img_b = create_image_bytes()
    file_obj = UploadFile(filename="notes.png", file=io.BytesIO(img_b))
    res = process_uploaded_file(file=file_obj)
    assert res["source_type"] == "image"
    assert len(res["extracted_text"]) > 0

def test_04_upload_file_exceeds_10mb():
    large_b = b"x" * (MAX_FILE_SIZE_BYTES + 1024)
    file_obj = UploadFile(filename="huge.pdf", file=io.BytesIO(large_b))
    with pytest.raises(HTTPException) as exc:
        process_uploaded_file(file=file_obj)
    assert exc.value.status_code == 400
    assert "exceeds 10MB limit" in exc.value.detail

def test_05_upload_unsupported_file_type():
    doc_b = b"dummy docx"
    file_obj = UploadFile(filename="test.docx", file=io.BytesIO(doc_b))
    with pytest.raises(HTTPException) as exc:
        process_uploaded_file(file=file_obj)
    assert exc.value.status_code == 400
    assert "Unsupported file format" in exc.value.detail

def test_06_paste_plain_text_directly():
    text = "Photosynthesis process mein plants sunlight absorb karke energy produce karte hain."
    res = process_uploaded_file(text_content=text)
    assert res["source_type"] == "text"
    assert res["extracted_text"] == text


# ==============================================================================
# SECTION 2.2: AUTH (TESTS 7-11)
# ==============================================================================

def test_07_signup_valid_email_password():
    email = f"student_{uuid.uuid4().hex[:8]}@example.com"
    res = client.post("/api/auth/signup", json={
        "email": email,
        "password": "Password123!",
        "name": "Student Seven"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_08_signup_existing_email_error():
    email = f"dup_{uuid.uuid4().hex[:8]}@example.com"
    payload = {"email": email, "password": "Password123!", "name": "Dup User"}
    client.post("/api/auth/signup", json=payload)
    res = client.post("/api/auth/signup", json=payload)
    assert res.status_code == 400
    assert "already registered" in res.json()["detail"]

def test_09_login_correct_credentials():
    email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    payload = {"email": email, "password": "Password123!", "name": "User Nine"}
    client.post("/api/auth/signup", json=payload)
    res = client.post("/api/auth/login", json={"email": email, "password": "Password123!"})
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_10_login_wrong_password_generic_error():
    email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    payload = {"email": email, "password": "Password123!", "name": "User Ten"}
    client.post("/api/auth/signup", json=payload)
    res = client.post("/api/auth/login", json={"email": email, "password": "WrongPassword!"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid email or password"

def test_11_access_protected_endpoint_without_token():
    res = client.get("/api/auth/me")
    assert res.status_code == 401


# ==============================================================================
# SECTION 2.3: AI GENERATION (TESTS 12-17)
# ==============================================================================

SAMPLE_TEXT_EN = "Newton's First Law of Motion states that an object will remain at rest or in uniform motion unless acted upon by force."
SAMPLE_TEXT_HI = "Yeh chapter Photosynthesis ke baare mein hai. Chlorophyll sunlight absorb karke energy banata hai."

def test_12_generate_summary_english():
    summary = generate_summary(SAMPLE_TEXT_EN, language="en")
    assert len(summary) > 20

def test_13_generate_summary_hinglish():
    summary = generate_summary(SAMPLE_TEXT_HI, language="hi")
    assert len(summary) > 20

def test_14_generate_mcqs():
    mcqs = generate_mcqs(SAMPLE_TEXT_EN)
    assert isinstance(mcqs, list)
    assert len(mcqs) == 10
    q1 = mcqs[0]
    assert "question" in q1 and len(q1["options"]) == 4 and "correct_index" in q1

def test_15_generate_flashcards():
    cards = generate_flashcards(SAMPLE_TEXT_EN)
    assert isinstance(cards, list)
    assert len(cards) >= 3
    assert "front" in cards[0] and "back" in cards[0]

def test_16_chat_grounded_answerable():
    doc_id = f"test_chat_grounded_{uuid.uuid4().hex[:6]}"
    index_document(doc_id, SAMPLE_TEXT_EN)
    res = generate_chat_response(doc_id, "What does Newton's first law state?")
    assert "response" in res and len(res["response"]) > 10
    delete_document_index(doc_id)

def test_17_chat_uncovered_out_of_scope():
    doc_id = f"test_chat_out_of_scope_{uuid.uuid4().hex[:6]}"
    index_document(doc_id, SAMPLE_TEXT_EN)
    res = generate_chat_response(doc_id, "Who built the Taj Mahal in Agra?")
    assert "covered nahi hai" in res["response"].lower() or "not covered" in res["response"].lower() or not res["is_grounded"]
    delete_document_index(doc_id)


# ==============================================================================
# SECTION 2.4: FREEMIUM LIMITS (TESTS 18-21)
# ==============================================================================

def test_18_free_user_three_uploads_success():
    _, token, _ = create_user("free18", tier="free")
    for i in range(3):
        res = client.post("/api/documents/upload", data={"text_content": f"Material {i}"}, headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200

def test_19_free_user_fourth_upload_blocked():
    _, token, _ = create_user("free19", tier="free")
    for i in range(3):
        client.post("/api/documents/upload", data={"text_content": f"Material {i}"}, headers={"Authorization": f"Bearer {token}"})
    res = client.post("/api/documents/upload", data={"text_content": "Material 4"}, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 402
    assert "Daily upload limit reached" in res.json()["detail"]

def test_20_freemium_reset_next_day():
    _, token, user_id = create_user("free20", tier="free")
    for i in range(3):
        client.post("/api/documents/upload", data={"text_content": f"Material {i}"}, headers={"Authorization": f"Bearer {token}"})
    
    # Simulate past date
    db = SessionLocal()
    u = db.query(UploadUsage).filter(UploadUsage.user_id == user_id).first()
    u.upload_date = date.today() - timedelta(days=1)
    db.commit()
    db.close()

    res = client.post("/api/documents/upload", data={"text_content": "Next day material"}, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200

def test_21_pro_user_unlimited_uploads():
    _, token, _ = create_user("pro21", tier="pro")
    for i in range(5):
        res = client.post("/api/documents/upload", data={"text_content": f"Pro Material {i}"}, headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200


# ==============================================================================
# SECTION 2.5: PAYMENTS (TESTS 22-24)
# ==============================================================================

def test_22_successful_razorpay_payment():
    _, token, user_id = create_user("pay22", tier="free")
    order_res = client.post("/api/payments/create-order", headers={"Authorization": f"Bearer {token}"})
    order_id = order_res.json()["order_id"]

    webhook_payload = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": f"pay_test_{uuid.uuid4().hex[:6]}",
                    "order_id": order_id,
                    "notes": {"user_id": user_id}
                }
            }
        }
    }
    client.post("/api/payments/webhook", json=webhook_payload)
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.json()["subscription_tier"] == "pro"

def test_23_failed_payment_keeps_free_tier():
    _, token, user_id = create_user("pay23", tier="free")
    webhook_payload = {
        "event": "payment.failed",
        "payload": {
            "payment": {
                "entity": {
                    "id": f"pay_failed_{uuid.uuid4().hex[:6]}",
                    "notes": {"user_id": user_id}
                }
            }
        }
    }
    client.post("/api/payments/webhook", json=webhook_payload)
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.json()["subscription_tier"] == "free"

def test_24_webhook_replay_idempotence():
    _, token, user_id = create_user("pay24", tier="free")
    order_res = client.post("/api/payments/create-order", headers={"Authorization": f"Bearer {token}"})
    order_id = order_res.json()["order_id"]

    webhook_payload = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": f"pay_replay_{uuid.uuid4().hex[:6]}",
                    "order_id": order_id,
                    "notes": {"user_id": user_id}
                }
            }
        }
    }
    res1 = client.post("/api/payments/webhook", json=webhook_payload)
    res2 = client.post("/api/payments/webhook", json=webhook_payload)
    assert res1.status_code == 200
    assert res2.status_code == 200


# ==============================================================================
# SECTION 2.6: RAG ISOLATION (TESTS 25-26)
# ==============================================================================

def test_25_rag_user_multi_tenant_isolation():
    doc_a_id = f"tenant_a_{uuid.uuid4().hex[:6]}"
    doc_b_id = f"tenant_b_{uuid.uuid4().hex[:6]}"
    text_a = "Thermodynamics deals with heat, work, and radiation."
    text_b = "Alkanes are saturated hydrocarbons containing single C-C bonds."

    index_document(doc_a_id, text_a)
    index_document(doc_b_id, text_b)

    results_a = query_document(doc_a_id, "What is thermodynamics?")
    assert len(results_a) > 0
    assert "heat, work" in results_a[0]["text"]

    results_b = query_document(doc_b_id, "What is thermodynamics?")
    for item in results_b:
        assert "thermodynamics" not in item["text"].lower()

    delete_document_index(doc_a_id)
    delete_document_index(doc_b_id)

def test_26_rag_same_user_multi_document_isolation():
    doc_1_id = f"same_user_phys_{uuid.uuid4().hex[:6]}"
    doc_2_id = f"same_user_bio_{uuid.uuid4().hex[:6]}"
    physics_text = "Quantum Entanglement occurs when a pair of particles interact."
    biology_text = "Mitochondria are double-membrane organelles, known as powerhouse of cell."

    index_document(doc_1_id, physics_text)
    index_document(doc_2_id, biology_text)

    res_physics = query_document(doc_1_id, "Explain quantum states")
    assert len(res_physics) > 0
    assert "Quantum Entanglement" in res_physics[0]["text"]
    assert "Mitochondria" not in res_physics[0]["text"]

    res_bio = query_document(doc_2_id, "What is the powerhouse of the cell?")
    assert len(res_bio) > 0
    assert "Mitochondria" in res_bio[0]["text"]
    assert "Quantum" not in res_bio[0]["text"]

    delete_document_index(doc_1_id)
    delete_document_index(doc_2_id)
