import pytest
from backend.services.llm_service import (
    generate_summary,
    generate_mcqs,
    generate_flashcards,
    generate_chat_response
)
from backend.services.rag_service import index_document, delete_document_index

SAMPLE_PHYSICS_TEXT = (
    "Newton's First Law of Motion states that an object will remain at rest or in uniform motion "
    "unless acted upon by an external force. This property is known as Inertia. "
    "Newton's Second Law states Force equals Mass times Acceleration (F = ma). "
    "Newton's Third Law states for every action, there is an equal and opposite reaction."
)

SAMPLE_HINGLISH_TEXT = (
    "Yeh chapter Photosynthesis ke baare mein hai. Plants sunlight, carbon dioxide, aur water ka use "
    "karke Glucose aur Oxygen banate hain. Primary pigment Chlorophyll hai jo leaves mein green color deta hai."
)

# Test 12: English summary generation
def test_12_english_summary():
    summary = generate_summary(SAMPLE_PHYSICS_TEXT, language="en")
    assert len(summary) > 20
    assert any(term in summary.lower() for term in ["newton", "motion", "inertia", "force", "study"])

# Test 13: Hindi/Hinglish summary generation
def test_13_hinglish_summary():
    summary = generate_summary(SAMPLE_HINGLISH_TEXT, language="hi")
    assert len(summary) > 20

# Test 14: MCQ generation
def test_14_mcq_generation():
    mcqs = generate_mcqs(SAMPLE_PHYSICS_TEXT)
    assert isinstance(mcqs, list)
    assert len(mcqs) == 10
    
    first = mcqs[0]
    assert "question" in first
    assert "options" in first
    assert len(first["options"]) == 4
    assert "correct_index" in first
    assert first["correct_index"] in [0, 1, 2, 3]

# Test 15: Flashcard generation
def test_15_flashcard_generation():
    cards = generate_flashcards(SAMPLE_PHYSICS_TEXT)
    assert isinstance(cards, list)
    assert len(cards) >= 3
    
    for card in cards:
        assert "front" in card and len(card["front"]) > 0
        assert "back" in card and len(card["back"]) > 0

# Test 16: Grounded chat question answerable from document
def test_16_grounded_chat_answerable():
    doc_id = "test_physics_doc_123"
    index_document(doc_id, SAMPLE_PHYSICS_TEXT)
    
    res = generate_chat_response(doc_id, "What is Newton's Second Law?")
    assert "response" in res
    assert len(res["response"]) > 10
    
    delete_document_index(doc_id)

# Test 17: Out-of-scope chat question
def test_17_out_of_scope_chat():
    doc_id = "test_physics_doc_123"
    index_document(doc_id, SAMPLE_PHYSICS_TEXT)

    # Ask something completely unrelated to Newton's laws (e.g. Mughal Dynasty history)
    res = generate_chat_response(doc_id, "Who built the Taj Mahal in Agra?")
    assert "response" in res
    assert "covered nahi hai" in res["response"].lower() or "not covered" in res["response"].lower() or not res["is_grounded"]

    delete_document_index(doc_id)
