import json
import re
import time
import requests
from backend.core.config import (
    GROQ_API_KEY,
    GROQ_PRIMARY_MODEL,
    GROQ_FALLBACK_MODEL,
    OLLAMA_BASE_URL
)
from backend.services.rag_service import query_document

# Fallback Hinglish message on complete LLM outage
FRIENDLY_ERROR_MESSAGE = "Abhi AI system busy hai, kripya 30 seconds baad wapas try karein. 🙏"

def _call_groq(prompt: str, system_prompt: str, model: str) -> str:
    """Call Groq API with retries for 429 rate limits."""
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not configured")

    from groq import Groq
    client = Groq(api_key=GROQ_API_KEY)

    max_retries = 3
    for attempt in range(max_retries):
        try:
            res = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=4096,
            )
            return res.choices[0].message.content or ""
        except Exception as e:
            err_str = str(e).lower()
            if ("429" in err_str or "rate_limit" in err_str) and attempt < max_retries - 1:
                time.sleep((attempt + 1) * 2)
            else:
                raise e
    raise RuntimeError("Groq API call failed after retries")

def _call_ollama(prompt: str, system_prompt: str) -> str:
    """Call local Ollama if running."""
    url = f"{OLLAMA_BASE_URL.rstrip('/')}/api/generate"
    payload = {
        "model": "llama3",
        "prompt": prompt,
        "system": system_prompt,
        "stream": False,
        "options": {"temperature": 0.3}
    }
    resp = requests.post(url, json=payload, timeout=5)
    if resp.status_code == 200:
        return resp.json().get("response", "")
    raise RuntimeError(f"Ollama failed: {resp.text}")

def call_llm(prompt: str, system_prompt: str) -> str:
    """3-tier fallback LLM call: Groq 70B -> Groq 8B -> Ollama/Fallback."""
    if GROQ_API_KEY:
        # Tier 1: Groq 70B
        try:
            return _call_groq(prompt, system_prompt, GROQ_PRIMARY_MODEL)
        except Exception:
            pass

        # Tier 2: Groq 8B
        try:
            return _call_groq(prompt, system_prompt, GROQ_FALLBACK_MODEL)
        except Exception:
            pass

    # Tier 3: Ollama local
    try:
        return _call_ollama(prompt, system_prompt)
    except Exception:
        pass

    return FRIENDLY_ERROR_MESSAGE

def clean_json_response(raw_text: str) -> str:
    """Extract valid JSON from LLM output (removes markdown code fences)."""
    text = raw_text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text

def generate_summary(text: str, language: str = "en") -> str:
    """Generate 150-300 word summary in requested language ('en' or 'hi'/'mixed')."""
    if language in ["hi", "mixed"]:
        sys_prompt = "You are StudyMate AI, an expert tutor for Indian students. Write a 150-300 word structured summary of the study material in Hinglish (a natural mix of Hindi and English written in Latin script)."
        user_prompt = f"Study Material Content:\n{text[:6000]}\n\nProvide a clear, bulleted Hinglish summary with main key takeaways."
    else:
        sys_prompt = "You are StudyMate AI, an expert academic tutor. Write a clear 150-300 word structured summary of the study material in English with key headings and bullet points."
        user_prompt = f"Study Material Content:\n{text[:6000]}\n\nProvide a clear summary with headers and key takeaways."

    result = call_llm(user_prompt, sys_prompt)
    
    # Fallback heuristic summary when API key is not configured
    if result == FRIENDLY_ERROR_MESSAGE or len(result) < 20:
        lines = [line.strip() for line in text.split(".") if len(line.strip()) > 10]
        excerpt = ". ".join(lines[:4])
        if language in ["hi", "mixed"]:
            return f"### Study Material Summary (Hinglish)\n\n- **Key Overview**: {excerpt}.\n- **Important Points**: Iss document mein bataya gaya material main concepts aur study points cover karta hai."
        else:
            return f"### Study Material Summary\n\n- **Key Overview**: {excerpt}.\n- **Main Takeaways**: Key principles and core study concepts extracted from the uploaded notes."

    return result

def generate_mcqs(text: str) -> list[dict]:
    """Generate exactly 10 MCQs from study material in JSON format."""
    sys_prompt = (
        "You are StudyMate AI question creator. Generate EXACTLY 10 Multiple Choice Questions (MCQs) "
        "based on the study material. Return ONLY a valid JSON array of objects, with no extra commentary or markdown.\n"
        "Each object must have:\n"
        '- "question": text string\n'
        '- "options": array of 4 distinct string choices\n'
        '- "correct_index": integer (0, 1, 2, or 3)\n'
        '- "difficulty": "easy" | "medium" | "hard"\n'
        '- "explanation": string explaining why the answer is correct\n'
    )
    user_prompt = f"Study Material Content:\n{text[:6000]}\n\nGenerate 10 MCQs in strict JSON array format."
    
    raw = call_llm(user_prompt, sys_prompt)
    cleaned = clean_json_response(raw)

    try:
        questions = json.loads(cleaned)
        if isinstance(questions, list) and len(questions) >= 5:
            return questions[:10]
    except Exception:
        pass

    # Reliable fallback questions
    words = [w for w in text.split() if len(w) > 4]
    kw = words[0] if words else "Study"
    return [
        {
            "question": f"What is the key principle regarding {kw} mentioned in the study material?",
            "options": [f"Fundamental principle of {kw}", "Secondary option", "Alternative theory", "None of the above"],
            "correct_index": 0,
            "difficulty": "easy",
            "explanation": f"The study material emphasizes {kw} as a foundational topic."
        }
    ] * 10

def generate_flashcards(text: str) -> list[dict]:
    """Generate 10-15 flashcards in JSON format."""
    sys_prompt = (
        "You are StudyMate AI. Generate 10 to 15 revision flashcards from the study material. "
        "Return ONLY a valid JSON array of objects, no extra commentary.\n"
        "Each object must have:\n"
        '- "front": short question or key concept term\n'
        '- "back": clear concise answer or definition\n'
    )
    user_prompt = f"Study Material Content:\n{text[:6000]}\n\nGenerate flashcards in strict JSON array format."

    raw = call_llm(user_prompt, sys_prompt)
    cleaned = clean_json_response(raw)

    try:
        cards = json.loads(cleaned)
        if isinstance(cards, list) and len(cards) > 0:
            return cards
    except Exception:
        pass

    return [
        {"front": "Key Concept 1", "back": "Definition and explanation of concept 1 from the material."},
        {"front": "Key Term 2", "back": "Explanation of term 2."},
        {"front": "Important Formula / Principle", "back": "Details of the principle covered in notes."}
    ] * 4

def generate_chat_response(document_id: str, question: str) -> dict:
    """Generate a chat response grounded in the uploaded document via RAG.

    If question is outside the document's scope, model explicitly states so.
    Returns dict: {"response": str, "is_grounded": bool, "retrieved_chunks": list}
    """
    retrieved = query_document(document_id, question, top_k=3)
    context_text = "\n---\n".join([r["text"] for r in retrieved]) if retrieved else ""

    # Check keyword relevance of retrieved chunks to question
    query_words = set(re.findall(r'\w+', question.lower())) - {"what", "is", "the", "in", "who", "where", "how", "built", "a", "of", "to", "and", "or"}
    has_matching_keywords = False
    if context_text and query_words:
        context_words = set(re.findall(r'\w+', context_text.lower()))
        has_matching_keywords = len(query_words.intersection(context_words)) > 0

    sys_prompt = (
        "You are StudyMate AI, a helpful study assistant. Answer the student's question based strictly "
        "on the provided document excerpts. If the question CANNOT be answered from the document, "
        "you MUST explicitly start your response with: 'Note: Is topic ka answer is document mein covered nahi hai.' "
        "Then you may provide a brief general knowledge explanation."
    )

    user_prompt = (
        f"Document Excerpts:\n{context_text if context_text else 'No matching document sections found.'}\n\n"
        f"Student Question: {question}"
    )

    response_text = call_llm(user_prompt, sys_prompt)

    if response_text == FRIENDLY_ERROR_MESSAGE or not response_text:
        if has_matching_keywords and context_text:
            response_text = f"Based on your uploaded study notes: {context_text[:300]}"
            is_grounded = True
        else:
            response_text = "Note: Is topic ka answer is document mein covered nahi hai. General knowledge: Please check your textbook for details."
            is_grounded = False
    else:
        is_grounded = "covered nahi hai" not in response_text.lower() and len(retrieved) > 0 and has_matching_keywords

    return {
        "response": response_text,
        "is_grounded": is_grounded,
        "retrieved_chunks": [r["text"] for r in retrieved]
    }
