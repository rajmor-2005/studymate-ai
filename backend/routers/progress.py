from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.core.security import get_current_user
from backend.models.user import User
from backend.models.document import Document
from backend.models.quiz import Quiz, QuizAttempt

router = APIRouter(prefix="/api/progress", tags=["progress"])

@router.get("")
def get_user_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()
    
    materials_summary = []
    all_attempts = []

    for doc in docs:
        quiz = db.query(Quiz).filter(Quiz.document_id == doc.id).first()
        best_score = None
        if quiz:
            attempts = db.query(QuizAttempt).filter(
                QuizAttempt.quiz_id == quiz.id,
                QuizAttempt.user_id == current_user.id
            ).order_by(QuizAttempt.attempted_at.asc()).all()

            if attempts:
                best_score = max(a.score for a in attempts)
                for att in attempts:
                    all_attempts.append({
                        "document_title": doc.title,
                        "score": att.score,
                        "total": 10,
                        "percentage": round((att.score / 10.0) * 100, 1),
                        "date": att.attempted_at.strftime("%Y-%m-%d %H:%M")
                    })

        materials_summary.append({
            "id": doc.id,
            "title": doc.title,
            "source_type": doc.source_type,
            "created_at": doc.created_at,
            "best_score": best_score
        })

    # Calculate active streak days in the past 7 days
    now = datetime.now(timezone.utc)
    active_dates = set()
    for doc in docs:
        if doc.created_at:
            active_dates.add(doc.created_at.date())

    attempts_db = db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).all()
    for att in attempts_db:
        if att.attempted_at:
            active_dates.add(att.attempted_at.date())

    today = now.date()
    streak = 0
    for i in range(7):
        d = today - timedelta(days=i)
        if d in active_dates:
            streak += 1

    return {
        "total_materials": len(docs),
        "total_quizzes_taken": len(all_attempts),
        "streak_days": streak,
        "materials": materials_summary,
        "quiz_history": all_attempts
    }
