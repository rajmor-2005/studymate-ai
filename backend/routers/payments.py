from fastapi import APIRouter, Depends, HTTPException, Request, Header, status
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.core.security import get_current_user
from backend.models.user import User
from backend.services.payment_service import (
    create_pro_order,
    verify_webhook_signature,
    process_payment_success
)

router = APIRouter(prefix="/api/payments", tags=["payments"])

@router.post("/create-order")
def create_order(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_pro_order(current_user.id, db)

@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    body_bytes = await request.body()
    
    # Verify signature if header is present
    if x_razorpay_signature:
        if not verify_webhook_signature(body_bytes, x_razorpay_signature):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    event = payload.get("event")
    if event == "payment.captured":
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        payment_id = payment_entity.get("id")
        order_id = payment_entity.get("order_id")
        user_id = payment_entity.get("notes", {}).get("user_id")

        if user_id:
            process_payment_success(payment_id=payment_id, order_id=order_id, user_id=user_id, db=db)

    return {"status": "ok"}
