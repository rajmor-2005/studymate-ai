import pytest
from backend.services.rag_service import index_document, query_document, delete_document_index

def test_25_rag_user_multi_tenant_isolation():
    # User A document (e.g. Thermodynamics)
    doc_a_id = "user_a_doc_101"
    text_a = "Thermodynamics is the branch of physics that deals with heat, work, and temperature, and their relation to energy and radiation."
    
    # User B document (e.g. Organic Chemistry)
    doc_b_id = "user_b_doc_202"
    text_b = "Alkanes are saturated hydrocarbons containing single C-C bonds with general formula CnH2n+2 like Methane and Ethane."

    index_document(doc_a_id, text_a)
    index_document(doc_b_id, text_b)

    # Query User A document
    results_a = query_document(doc_a_id, "What is thermodynamics?")
    assert len(results_a) > 0
    assert "heat, work, and temperature" in results_a[0]["text"]
    assert "hydrocarbons" not in results_a[0]["text"]

    # Query User B document for User A's content
    results_b = query_document(doc_b_id, "What is thermodynamics?")
    # Must retrieve ONLY from User B's collection (which contains alkanes), never User A's content
    for item in results_b:
        assert "thermodynamics" not in item["text"].lower()

    # Cleanup
    delete_document_index(doc_a_id)
    delete_document_index(doc_b_id)

def test_26_rag_same_user_multi_document_isolation():
    user_id = "user_777"
    doc_1_id = f"{user_id}_physics"
    doc_2_id = f"{user_id}_biology"

    physics_text = "Quantum Entanglement occurs when a pair of particles interact such that quantum state of each particle cannot be described independently."
    biology_text = "Mitochondria are double-membrane-bound organelle found in most eukaryotic organisms, known as the powerhouse of the cell."

    index_document(doc_1_id, physics_text)
    index_document(doc_2_id, biology_text)

    # Query Physics document
    physics_res = query_document(doc_1_id, "Explain quantum states")
    assert len(physics_res) > 0
    assert "Quantum Entanglement" in physics_res[0]["text"]
    assert "Mitochondria" not in physics_res[0]["text"]

    # Query Biology document
    biology_res = query_document(doc_2_id, "What is the powerhouse of the cell?")
    assert len(biology_res) > 0
    assert "Mitochondria" in biology_res[0]["text"]
    assert "Quantum" not in biology_res[0]["text"]

    # Cleanup
    delete_document_index(doc_1_id)
    delete_document_index(doc_2_id)
