# StudyMate AI — Product Requirements Document (PRD)

## 1. Overview & Problem Statement

Indian students and teachers rely on scattered study material — PDFs, photographed notes, textbook chapters — with no easy way to convert this into structured revision tools (summaries, flashcards, practice questions). Existing tools (Quizlet, Notion AI) are English-only, expensive, and don't understand Indian exam patterns (board exams, JEE/NEET, UPSC, university semester exams) or Hinglish-mixed study habits.

**StudyMate AI** turns any uploaded study material into an interactive study companion — summarized, quizzed, and chat-able — in both English and Hindi/Hinglish, built specifically around how Indian students actually study.

## 2. Goals & Success Metrics

| Goal | Metric | V1 Target |
|------|--------|-----------|
| Prove core value | Users who generate ≥1 summary/quiz | 50 users in first month |
| Retention | Users who return within 7 days | 30% |
| Conversion | Free → Paid upgrade | 5% of active users |
| Quality | AI summary/MCQ accuracy (manual review) | 85%+ judged "useful" |

## 3. Target Users

- **Students**: School (board exams), college/university (semester exams), competitive exam aspirants (JEE, NEET, UPSC, Gujarat board and other state boards)
- **Teachers**: Converting their own material into quizzes/summaries to share with students

## 4. Scope

### V1 — In Scope
- Upload: PDF, images (photographed notes), pasted text
- AI-generated summary (English + Hindi/Hinglish)
- Auto-generated MCQ practice questions
- Auto-generated flashcards
- Chat with your uploaded notes (ask questions, get answers grounded in the material)
- Basic progress tracking (what's been studied, quiz scores over time)
- Freemium: 3 uploads/day free, ₹199/month unlimited
- Website only (responsive, works on mobile browser)

### Explicitly Out of Scope for V1 (V2+)
- YouTube video → notes extraction
- Native mobile app
- WhatsApp bot integration
- Professional certification-specific content
- Teacher-side classroom/bulk management tools

## 5. User Flow (V1)

```
1. Sign up / Login
2. Upload material (PDF/image/text)
3. AI processes → generates: Summary + MCQs + Flashcards (shown together)
4. User can: 
   - Read summary
   - Take the MCQ quiz → get score
   - Review flashcards
   - Chat with the material ("is topic ka real-life example do")
5. Progress dashboard shows: materials studied, quiz scores, streaks
6. Free tier hits limit → upgrade prompt → Razorpay checkout
```

## 6. Functional Requirements (Priority)

| Feature | Priority |
|---------|----------|
| PDF/Image/Text upload + processing | Must |
| AI Summary (bilingual) | Must |
| MCQ generation | Must |
| Flashcard generation | Must |
| Chat with notes | Must |
| Basic auth (signup/login) | Must |
| Progress tracking (basic) | Should |
| Freemium limits + Razorpay upgrade | Should |
| Multi-document library (saved uploads) | Should |
| Export flashcards/summary as PDF | Nice-to-have |

## 7. Non-Functional Requirements

- **Cost**: Zero infrastructure cost for V1 (free-tier services only — Groq API, SQLite, free hosting tier)
- **Performance**: Summary/MCQ generation under 15 seconds per document
- **Privacy**: Uploaded documents are private to each user by default
- **Language**: Must handle Hinglish input/output naturally, not just literal Hindi translation

## 8. Assumptions & Constraints

- Built on existing RAG infrastructure (`D:\llm_rag\rag_system\` — ChromaDB, Groq provider chain) already proven to work
- Developer is a solo BSc IT student, building alongside coursework — timeline must stay realistic (2-week V1 build)
- No dedicated GPU — all AI calls go through Groq (free tier) with local Ollama as fallback only

## 9. Milestones

| Phase | Timeline |
|-------|----------|
| Backend + document processing pipeline | Week 1 |
| Frontend + core flows | Week 1-2 |
| Testing + polish | End of Week 2 |
| Public launch (GitHub + LinkedIn + college outreach) | Week 3 |
