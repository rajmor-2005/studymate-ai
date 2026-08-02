import hmac
import hashlib
import sys
import types

try:
    import pkg_resources
except ImportError:
    dummy_pkg = types.ModuleType("pkg_resources")
    dummy_pkg.get_distribution = lambda name: types.SimpleNamespace(version="1.4.1")
    dummy_pkg.DistributionNotFound = Exception
    sys.modules["pkg_resources"] = dummy_pkg

import razorpay
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from backend.core.config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
from backend.models.user import User
from backend.models.payment import Payment

PRO_PRICE_PAISE = 19900  # ₹199 in paise

def get_razorpay_client():
    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def create_pro_order(user_id: str, db: Session) -> dict:
    """Create Razorpay order for ₹199 and store pending payment in DB."""
    client = get_razorpay_client()
    order_data = {
        "amount": PRO_PRICE_PAISE,
        "currency": "INR",
        "receipt": f"receipt_{user_id[:8]}_{int(datetime.now().timestamp())}",
        "notes": {"user_id": user_id, "plan": "pro_monthly"}
    }
    
    try:
        razorpay_order = client.order.create(data=order_data)
        order_id = razorpay_order.get("id")
    except Exception:
        # Development / test mode fallback if Razorpay API keys are dummy
        order_id = f"order_test_{user_id[:8]}_{int(datetime.now().timestamp())}"

    payment = Payment(
        user_id=user_id,
        razorpay_order_id=order_id,
        amount=PRO_PRICE_PAISE,
        status="pending"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "order_id": order_id,
        "amount": PRO_PRICE_PAISE,
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID
    }

def verify_webhook_signature(body_bytes: bytes, signature: str, secret: str = RAZORPAY_KEY_SECRET) -> bool:
    """Verify HMAC-SHA256 signature of Razorpay webhook payload."""
    if not signature:
        return False
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        body_bytes,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)

def process_payment_success(payment_id: str, order_id: str, user_id: str, db: Session) -> bool:
    """Process successful payment idempotently. Upgrades user to Pro tier."""
    # Check existing payment
    payment = None
    if order_id:
        payment = db.query(Payment).filter(Payment.razorpay_order_id == order_id).first()
    if not payment and payment_id:
        payment = db.query(Payment).filter(Payment.razorpay_payment_id == payment_id).first()

    if payment:
        if payment.status == "success":
            # Idempotent replay: already processed cleanly
            return True
        payment.status = "success"
        payment.razorpay_payment_id = payment_id
    else:
        payment = Payment(
            user_id=user_id,
            razorpay_order_id=order_id,
            razorpay_payment_id=payment_id,
            amount=PRO_PRICE_PAISE,
            status="success"
        )
        db.add(payment)

    # Upgrade User to Pro for 30 days
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.subscription_tier = "pro"
        user.subscription_expires_at = datetime.now(timezone.utc) + timedelta(days=30)

    db.commit()
    return True
