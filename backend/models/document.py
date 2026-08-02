import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from backend.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    source_type = Column(String, nullable=False)  # 'pdf' | 'image' | 'text'
    original_filename = Column(String, nullable=True)
    extracted_text = Column(Text, nullable=False)
    chroma_collection_id = Column(String, nullable=False, index=True)
    language_detected = Column(String, default="en")  # 'en' | 'hi' | 'mixed'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
