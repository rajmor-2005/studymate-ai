import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.core.database import SessionLocal
from backend.models.user import User
from backend.models.payment import Payment
from backend.services.payment_service import process_payment_success

client = TestClient(app)

def create_payment_test_user(email: str) -> tuple[str, str]:
    res = client.post("/api/auth/signup", json={
        "email": email,
        "password": "Password123!",
        "name": "Payment Test User"
    })
    token = res.json()["access_token"]
    user_id = res.json()["user"]["id"]
    return token, user_id

# Test 22: Successful Razorpay payment upgrades tier to 'pro'
def test_22_successful_razorpay_payment():
    token, user_id = create_payment_test_user("payment_user22@example.com")
    
    # 1. Create order
    order_res = client.post("/api/payments/create-order", headers={"Authorization": f"Bearer {token}"})
    assert order_res.status_code == 200
    order_id = order_res.json()["order_id"]

    # 2. Simulate Razorpay webhook payment.captured event
    webhook_payload = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_test_22",
                    "order_id": order_id,
                    "notes": {"user_id": user_id}
                }
            }
        }
    }
    web_res = client.post("/api/payments/webhook", json=webhook_payload)
    assert web_res.status_code == 200

    # 3. Verify user tier is upgraded to 'pro'
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.json()["subscription_tier"] == "pro"

# Test 23: Failed payment leaves user on 'free' tier
def test_23_failed_payment_keeps_free_tier():
    token, user_id = create_payment_test_user("payment_user23@example.com")

    # Simulate webhook payment.failed event
    webhook_payload = {
        "event": "payment.failed",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_test_failed_23",
                    "notes": {"user_id": user_id}
                }
            }
        }
    }
    web_res = client.post("/api/payments/webhook", json=webhook_payload)
    assert web_res.status_code == 200

    # Verify user remains on 'free' tier
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.json()["subscription_tier"] == "free"

# Test 24: Webhook replay (duplicate event) is idempotent
def test_24_webhook_replay_idempotence():
    token, user_id = create_payment_test_user("payment_user24@example.com")
    
    order_res = client.post("/api/payments/create-order", headers={"Authorization": f"Bearer {token}"})
    order_id = order_res.json()["order_id"]

    webhook_payload = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_test_replay_24",
                    "order_id": order_id,
                    "notes": {"user_id": user_id}
                }
            }
        }
    }

    # Send webhook twice
    res1 = client.post("/api/payments/webhook", json=webhook_payload)
    res2 = client.post("/api/payments/webhook", json=webhook_payload)

    assert res1.status_code == 200
    assert res2.status_code == 200

    # Verify user is pro and only 1 payment record exists for order
    db = SessionLocal()
    payments = db.query(Payment).filter(Payment.razorpay_order_id == order_id).all()
    user = db.query(User).filter(User.id == user_id).first()
    
    assert user.subscription_tier == "pro"
    assert len(payments) == 1
    assert payments[0].status == "success"
    db.close()
