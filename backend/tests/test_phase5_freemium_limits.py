import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from backend.main import app
from backend.core.database import SessionLocal
from backend.models.user import User
from backend.models.payment import UploadUsage

client = TestClient(app)

def create_test_user(email: str, tier: str = "free") -> tuple[dict, str]:
    signup_data = {
        "email": email,
        "password": "Password123!",
        "name": f"User {email}"
    }
    res = client.post("/api/auth/signup", json=signup_data)
    token = res.json()["access_token"]
    user_id = res.json()["user"]["id"]

    if tier == "pro":
        db = SessionLocal()
        u = db.query(User).filter(User.id == user_id).first()
        u.subscription_tier = "pro"
        db.commit()
        db.close()

    return signup_data, token

def upload_sample_doc(token: str, title_suffix: str) -> int:
    res = client.post(
        "/api/documents/upload",
        data={"text_content": f"Sample study material content {title_suffix} for freemium testing."},
        headers={"Authorization": f"Bearer {token}"}
    )
    return res.status_code

# Test 18: Free user uploads 3 documents in a day -> All succeed
def test_18_free_user_three_uploads_success():
    _, token = create_test_user("free_student18@example.com", tier="free")
    
    assert upload_sample_doc(token, "doc1") == 200
    assert upload_sample_doc(token, "doc2") == 200
    assert upload_sample_doc(token, "doc3") == 200

# Test 19: Free user attempts 4th upload same day -> Blocked with 402
def test_19_free_user_fourth_upload_blocked():
    _, token = create_test_user("free_student19@example.com", tier="free")
    
    for i in range(3):
        assert upload_sample_doc(token, f"doc_{i}") == 200

    # 4th upload attempt
    res = client.post(
        "/api/documents/upload",
        data={"text_content": "4th material attempt"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 402
    assert "Daily upload limit reached" in res.json()["detail"]

# Test 20: Upload count resets after midnight (simulated next day)
def test_20_freemium_reset_next_day():
    user_data, token = create_test_user("free_student20@example.com", tier="free")
    user_id = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).json()["id"]

    # Fill today's quota (3 uploads)
    for i in range(3):
        assert upload_sample_doc(token, f"doc_{i}") == 200

    # Verify 4th is blocked today
    assert client.post("/api/documents/upload", data={"text_content": "blocked"}, headers={"Authorization": f"Bearer {token}"}).status_code == 402

    # Simulate past date for existing usage record in DB so today has 0 usage
    db = SessionLocal()
    usage = db.query(UploadUsage).filter(UploadUsage.user_id == user_id).first()
    usage.upload_date = date.today() - timedelta(days=1)
    db.commit()
    db.close()

    # 4th upload attempt now succeeds as usage is 0 for new day
    assert upload_sample_doc(token, "next_day_doc") == 200

# Test 21: Pro user uploads more than 3 in a day -> No limit
def test_21_pro_user_unlimited_uploads():
    _, token = create_test_user("pro_student21@example.com", tier="pro")

    for i in range(5):
        assert upload_sample_doc(token, f"pro_doc_{i}") == 200
