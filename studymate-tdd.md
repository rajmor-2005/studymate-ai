# StudyMate AI — Technical Design Document (TDD)

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  Upload UI / Summary+MCQ+Flashcard viewer / Chat / Dashboard │
└───────────────────────────┬────────────────────────────────┘
                            │ REST API (JWT)
┌───────────────────────────▼────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Document Processing Service                          │   │
│  │  PDF (PyMuPDF) / Image OCR (Tesseract) / Text        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ RAG + LLM Service (reuses D:\llm_rag\rag_system\)     │   │
│  │  - Per-document ChromaDB collection                  │   │
│  │  - Groq 70B → Groq 8B → Ollama fallback chain         │   │
│  │  - Summary / MCQ / Flashcard / Chat prompt templates  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Payments Service (Razorpay)                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Database (SQLite → Postgres-ready via SQLAlchemy)     │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## 2. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Backend | FastAPI | Existing developer expertise |
| Frontend | React + Vite | Fast dev, matches Nomi project patterns |
| LLM | Groq (primary) → Ollama (fallback) | Free, fast, proven chain from Nomi |
| Embeddings | nomic-embed-text via Ollama | Free, local, already working |
| Vector DB | ChromaDB | Already proven in `rag_system/` |
| PDF parsing | PyMuPDF (`fitz`) | Free, reliable text extraction |
| OCR | Tesseract (`pytesseract`) | Free, handles photographed notes |
| Database | SQLite (dev) → PostgreSQL (prod, when scaling) | Zero-cost start, easy upgrade path |
| Auth | JWT (python-jose + passlib) | Matches existing Nomi backend pattern |
| Payments | Razorpay | Developer's existing integration experience |
| Hosting (backend) | Render (free tier) | Zero cost, supports FastAPI + persistent disk for SQLite |
| Hosting (frontend) | Vercel or Render static | Zero cost, fast global CDN |

## 3. Database Schema

```sql
users
  id (PK, UUID)
  email (unique)
  hashed_password
  name
  subscription_tier  -- 'free' | 'pro'
  subscription_expires_at  -- nullable
  created_at

documents
  id (PK, UUID)
  user_id (FK -> users)
  title  -- auto-generated from content
  source_type  -- 'pdf' | 'image' | 'text'
  original_filename  -- nullable
  extracted_text  -- full text, stored for re-processing if needed
  chroma_collection_id  -- per-document collection name
  language_detected  -- 'en' | 'hi' | 'mixed'
  created_at

summaries
  id (PK, UUID)
  document_id (FK -> documents)
  content_en
  content_hi  -- nullable, generated on demand
  created_at

quizzes
  id (PK, UUID)
  document_id (FK -> documents)
  questions_json  -- array of {question, options[4], correct_index, difficulty}
  created_at

quiz_attempts
  id (PK, UUID)
  quiz_id (FK -> quizzes)
  user_id (FK -> users)
  score
  answers_json
  attempted_at

flashcards
  id (PK, UUID)
  document_id (FK -> documents)
  cards_json  -- array of {front, back}
  created_at

chat_messages
  id (PK, UUID)
  document_id (FK -> documents)
  user_id (FK -> users)
  role  -- 'user' | 'assistant'
  content
  created_at

upload_usage
  id (PK, UUID)
  user_id (FK -> users)
  upload_date  -- date only, for daily limit tracking
  count

payments
  id (PK, UUID)
  user_id (FK -> users)
  razorpay_payment_id
  amount
  status  -- 'success' | 'failed' | 'pending'
  created_at
```

## 4. API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Return JWT |
| POST | `/api/documents/upload` | Upload PDF/image/text, triggers processing |
| GET | `/api/documents` | List user's uploaded materials |
| GET | `/api/documents/{id}` | Get full detail (summary + quiz + flashcards) |
| DELETE | `/api/documents/{id}` | Remove document + its data |
| POST | `/api/documents/{id}/summary` | Regenerate/toggle language summary |
| POST | `/api/documents/{id}/quiz/attempt` | Submit quiz answers, get score |
| GET | `/api/documents/{id}/chat/history` | Get chat history for this document |
| POST | `/api/documents/{id}/chat/message` | Send chat message, get RAG-grounded response |
| GET | `/api/progress` | Get user's study library + quiz score history |
| POST | `/api/payments/create-order` | Create Razorpay order for Pro upgrade |
| POST | `/api/payments/webhook` | Razorpay webhook — confirms payment, upgrades tier |

## 5. RAG Integration Detail

Reuse the existing pipeline from `D:\llm_rag\rag_system\` with one key change: instead of one shared `automation_knowledge` collection, each uploaded document gets its **own ChromaDB collection** (named by `document.chroma_collection_id`), so chat retrieval stays scoped to that specific document and never mixes content across users' materials.

```python
# On upload:
1. Extract text (PDF/OCR/paste)
2. Chunk (500 words, 50 overlap — reuse existing chunker logic)
3. Embed via nomic-embed-text (existing embedding function)
4. Store in a NEW collection: f"doc_{document_id}"

# On chat query:
1. Embed user's question
2. Query ONLY that document's collection (not global)
3. Inject retrieved chunks + question into LLM call
4. Use existing Groq → Groq fallback → Ollama chain from config.py
```

Summary/MCQ/Flashcard generation use the full extracted text directly (not retrieval) since these operate on the whole document, not a targeted query — RAG retrieval is specifically for the chat feature.

## 6. File Structure

```
studymate_ai/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   ├── core/
│   │   ├── config.py          # imports LLM chain config from rag_system
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   ├── user.py
│   │   ├── document.py
│   │   ├── quiz.py
│   │   ├── flashcard.py
│   │   ├── chat.py
│   │   └── payment.py
│   ├── services/
│   │   ├── document_processor.py   # PDF/OCR/text extraction
│   │   ├── rag_service.py          # per-document ChromaDB collections
│   │   ├── llm_service.py          # summary/MCQ/flashcard/chat generation
│   │   └── payment_service.py      # Razorpay integration
│   └── routers/
│       ├── auth.py
│       ├── documents.py
│       ├── progress.py
│       └── payments.py
├── frontend/
│   └── (standard Vite + React structure, detailed in UI/UX spec)
└── deployment/
    ├── render.yaml           # Render deployment config
    └── DEPLOY.md             # step-by-step deployment guide
```

## 7. Production Deployment Plan

### 7.1 Backend (Render, free tier)
1. Push code to GitHub (public or private repo)
2. Create Render Web Service, connect GitHub repo
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (Section 7.3) in Render dashboard
6. Attach a free persistent disk for SQLite database file (Render supports this on free tier with limitations — document the constraint that free tier disks are ephemeral on redeploy, so plan a backup/export routine, or move to Render's free PostgreSQL addon if persistence proves unreliable)

### 7.2 Frontend (Vercel, free tier)
1. Connect GitHub repo
2. Framework preset: Vite
3. Build command: `npm run build`
4. Environment variable: `VITE_API_URL` pointing to the Render backend URL
5. Auto-deploys on every push to main branch

### 7.3 Environment Variables (Production)

```
# Backend
DATABASE_URL=sqlite:///./studymate.db   # or Postgres URL if upgraded
JWT_SECRET=<random_generated_secret>
GROQ_API_KEY=<from console.groq.com>
GROQ_PRIMARY_MODEL=llama-3.3-70b-versatile
GROQ_FALLBACK_MODEL=llama-3.1-8b-instant
OLLAMA_BASE_URL=<only if using local fallback — likely omitted in prod, Groq-only>
RAZORPAY_KEY_ID=<from razorpay dashboard>
RAZORPAY_KEY_SECRET=<from razorpay dashboard>
FRONTEND_URL=https://studymate.vercel.app   # for CORS

# Frontend
VITE_API_URL=https://studymate-backend.onrender.com
```

**Note on Ollama fallback in production**: since Render's free tier can't run Ollama locally, the production fallback chain is Groq 70B → Groq 8B only. If both fail, show the friendly retry message (per Nomi's existing pattern) rather than crashing — no local LLM safety net exists in the cloud environment.

### 7.4 CI/CD (Minimal, Free)
- GitHub Actions: run a basic test suite (Section on Test Plan) on every push to `main`
- No auto-deploy gate initially — Render/Vercel auto-deploy on push is sufficient for V1; add a manual approval step later if needed

### 7.5 Monitoring (Free tier)
- Render's built-in logs for backend errors
- Simple `/api/health` endpoint checked manually or via a free uptime monitor (e.g., UptimeRobot free tier) for basic availability tracking

## 8. Scaling Path (Post-V1, Not Built Now)

| When | What Changes |
|------|--------------|
| SQLite write contention under real load | Migrate to Render's free/paid PostgreSQL |
| Groq free tier insufficient | Add Gemini Flash as a 3rd fallback tier (same pattern as Nomi) |
| ChromaDB collections growing large | Move to Chroma Cloud or a managed vector DB |
| Need custom domain | Point domain to Vercel + Render, ~₹700/year |
