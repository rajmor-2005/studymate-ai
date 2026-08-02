import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime
from backend.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False, index=True)
    questions_json = Column(Text, nullable=False)  # JSON array of {question, options[4], correct_index, explanation, difficulty}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String, primary_key=True, default=generate_uuid)
    quiz_id = Column(String, ForeignKey("quizzes.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    answers_json = Column(Text, nullable=False)
    attempted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
