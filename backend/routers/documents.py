import json
from datetime import datetime, timezone, date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.core.security import get_current_user
from backend.models.user import User
from backend.models.document import Document
from backend.models.summary import Summary
from backend.models.quiz import Quiz, QuizAttempt
from backend.models.flashcard import Flashcard
from backend.models.chat import ChatMessage
from backend.models.payment import UploadUsage
from backend.services.document_processor import process_uploaded_file
from backend.services.rag_service import index_document, delete_document_index
from backend.services.llm_service import (
    generate_summary,
    generate_mcqs,
    generate_flashcards,
    generate_chat_response
)

router = APIRouter(prefix="/api/documents", tags=["documents"])

DAILY_FREE_LIMIT = 3

def check_and_increment_upload_limit(user: User, db: Session) -> int:
    """Check daily upload limit for free users. Raises HTTP 402 if limit reached. Increments count on success."""
    today = date.today()
    
    if user.subscription_tier == "pro":
        return 0  # Unlimited for Pro

    usage = db.query(UploadUsage).filter(
        UploadUsage.user_id == user.id,
        UploadUsage.upload_date == today
    ).first()

    if not usage:
        usage = UploadUsage(user_id=user.id, upload_date=today, count=0)
        db.add(usage)
        db.commit()
        db.refresh(usage)

    if usage.count >= DAILY_FREE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Daily upload limit reached (3/3). Upgrade to Pro for unlimited uploads!"
        )

    usage.count += 1
    db.commit()
    return usage.count

@router.post("/upload")
def upload_document(
    file: Optional[UploadFile] = File(None),
    text_content: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Freemium check
    check_and_increment_upload_limit(current_user, db)

    # 2. Extract text & validate format/size
    processed = process_uploaded_file(file=file, text_content=text_content)
    
    # Generate automatic title from first line or filename
    first_line = processed["extracted_text"].split("\n")[0].strip()
    title = (first_line[:60] if len(first_line) > 5 else processed["filename"])

    # 3. Save Document in DB
    document = Document(
        user_id=current_user.id,
        title=title,
        source_type=processed["source_type"],
        original_filename=processed["filename"],
        extracted_text=processed["extracted_text"],
        chroma_collection_id=f"doc_{current_user.id}",
        language_detected=processed["language"]
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    # Update collection ID to be unique to this document
    document.chroma_collection_id = f"doc_{document.id}"
    db.commit()

    # 4. RAG Indexing (ChromaDB)
    index_document(document.id, document.extracted_text)

    # 5. Generate AI Summary, MCQs, Flashcards
    summary_text = generate_summary(document.extracted_text, language=document.language_detected)
    summary = Summary(
        document_id=document.id,
        content_en=summary_text if document.language_detected == "en" else generate_summary(document.extracted_text, "en"),
        content_hi=summary_text if document.language_detected in ["hi", "mixed"] else generate_summary(document.extracted_text, "hi")
    )
    db.add(summary)

    mcq_data = generate_mcqs(document.extracted_text)
    quiz = Quiz(
        document_id=document.id,
        questions_json=json.dumps(mcq_data)
    )
    db.add(quiz)

    flashcard_data = generate_flashcards(document.extracted_text)
    flashcard_deck = Flashcard(
        document_id=document.id,
        cards_json=json.dumps(flashcard_data)
    )
    db.add(flashcard_deck)

    db.commit()

    return {
        "id": document.id,
        "title": document.title,
        "source_type": document.source_type,
        "language_detected": document.language_detected,
        "created_at": document.created_at,
        "summary": {
            "content_en": summary.content_en,
            "content_hi": summary.content_hi
        },
        "quiz_id": quiz.id,
        "questions_count": len(mcq_data),
        "flashcards_count": len(flashcard_data)
    }

@router.get("")
def list_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()
    
    res = []
    for d in docs:
        # Get best quiz score if attempted
        quiz = db.query(Quiz).filter(Quiz.document_id == d.id).first()
        best_score = None
        if quiz:
            attempts = db.query(QuizAttempt).filter(QuizAttempt.quiz_id == quiz.id, QuizAttempt.user_id == current_user.id).all()
            if attempts:
                best_score = max(a.score for a in attempts)

        res.append({
            "id": d.id,
            "title": d.title,
            "source_type": d.source_type,
            "original_filename": d.original_filename,
            "language_detected": d.language_detected,
            "created_at": d.created_at,
            "best_quiz_score": best_score
        })
    return res

@router.get("/{document_id}")
def get_document_detail(document_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    summary = db.query(Summary).filter(Summary.document_id == doc.id).first()
    quiz = db.query(Quiz).filter(Quiz.document_id == doc.id).first()
    flashcards = db.query(Flashcard).filter(Flashcard.document_id == doc.id).first()

    return {
        "id": doc.id,
        "title": doc.title,
        "source_type": doc.source_type,
        "original_filename": doc.original_filename,
        "extracted_text": doc.extracted_text,
        "language_detected": doc.language_detected,
        "created_at": doc.created_at,
        "summary": {
            "content_en": summary.content_en if summary else "",
            "content_hi": summary.content_hi if summary else ""
        },
        "quiz": {
            "id": quiz.id if quiz else None,
            "questions": json.loads(quiz.questions_json) if quiz else []
        },
        "flashcards": {
            "id": flashcards.id if flashcards else None,
            "cards": json.loads(flashcards.cards_json) if flashcards else []
        }
    }

@router.delete("/{document_id}")
def delete_document(document_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete ChromaDB collection
    delete_document_index(document_id)

    # Delete related DB records
    db.query(Summary).filter(Summary.document_id == document_id).delete()
    quiz = db.query(Quiz).filter(Quiz.document_id == document_id).first()
    if quiz:
        db.query(QuizAttempt).filter(QuizAttempt.quiz_id == quiz.id).delete()
        db.delete(quiz)
    db.query(Flashcard).filter(Flashcard.document_id == document_id).delete()
    db.query(ChatMessage).filter(ChatMessage.document_id == document_id).delete()
    db.delete(doc)
    db.commit()

    return {"message": "Document deleted successfully"}

@router.post("/{document_id}/quiz/attempt")
def submit_quiz_attempt(
    document_id: str,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quiz = db.query(Quiz).filter(Quiz.document_id == document_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found for this document")

    questions = json.loads(quiz.questions_json)
    user_answers = payload.get("answers", [])  # list of user selected option indices [0, 2, 1...]

    score = 0
    review = []
    for i, q in enumerate(questions):
        user_choice = user_answers[i] if i < len(user_answers) else None
        is_correct = (user_choice == q["correct_index"])
        if is_correct:
            score += 1
        review.append({
            "question": q["question"],
            "options": q["options"],
            "user_choice": user_choice,
            "correct_index": q["correct_index"],
            "is_correct": is_correct,
            "explanation": q.get("explanation", "")
        })

    attempt = QuizAttempt(
        quiz_id=quiz.id,
        user_id=current_user.id,
        score=score,
        answers_json=json.dumps(user_answers)
    )
    db.add(attempt)
    db.commit()

    return {
        "score": score,
        "total": len(questions),
        "percentage": round((score / len(questions)) * 100, 1),
        "review": review
    }

@router.get("/{document_id}/chat/history")
def get_chat_history(document_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(
        ChatMessage.document_id == document_id,
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at.asc()).all()

    return [
        {"id": m.id, "role": m.role, "content": m.content, "created_at": m.created_at}
        for m in messages
    ]

@router.post("/{document_id}/chat/message")
def send_chat_message(
    document_id: str,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = payload.get("message", "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Store user message
    user_msg = ChatMessage(document_id=document_id, user_id=current_user.id, role="user", content=question)
    db.add(user_msg)
    db.commit()

    # Generate RAG response
    bot_res = generate_chat_response(document_id, question)

    # Store assistant message
    assistant_msg = ChatMessage(document_id=document_id, user_id=current_user.id, role="assistant", content=bot_res["response"])
    db.add(assistant_msg)
    db.commit()

    return {
        "user_message": question,
        "assistant_message": bot_res["response"],
        "is_grounded": bot_res["is_grounded"]
    }
