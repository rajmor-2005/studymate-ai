import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Date, ForeignKey, DateTime
from backend.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class UploadUsage(Base):
    __tablename__ = "upload_usage"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    upload_date = Column(Date, nullable=False, index=True)
    count = Column(Integer, default=0)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    razorpay_payment_id = Column(String, nullable=True, index=True)
    razorpay_order_id = Column(String, nullable=True, index=True)
    amount = Column(Integer, nullable=False)  # in paise (19900 = ₹199)
    status = Column(String, default="pending")  # 'success' | 'failed' | 'pending'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
