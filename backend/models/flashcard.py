import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from backend.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False, index=True)
    cards_json = Column(Text, nullable=False)  # JSON array of {front, back}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
