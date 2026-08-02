# 📚 StudyMate AI — Bilingual AI Study Companion

> **Apna material upload karo, StudyMate baaki karega.**

StudyMate AI is a production-grade, bilingual (English & Hindi-Hinglish) AI study companion designed specifically for Indian students and teachers. Upload PDFs, photographed notes, or text excerpts, and get instant structured summaries, 10-MCQ practice quizzes, 3D flip flashcards, and a document-grounded AI chat companion.

Built with a zero-cost operational model using FastAPI, React, ChromaDB, Groq LLM (with 3-tier fallback), and Razorpay payments.

---

## 🌟 Key Features

- 📄 **Multi-Format Study Processing**: Accepts `.pdf` (PyMuPDF with Tesseract OCR fallback), image notes (`.jpg`, `.jpeg`, `.png`), or direct text paste (up to 10MB).
- 🌐 **True Bilingual Output**: Generates natural English and Hinglish (Latin script Hindi/English mix) summaries tailored for Indian study habits.
- 🎯 **Exam-Style 10-MCQ Practice Quizzes**: Auto-generates 10 practice questions with immediate scoring, wrong answer explanations, and retake support.
- 🎴 **Interactive 3D Flashcards**: 3D flip card carousel with front/back toggle, keyboard navigation, and "Mark as Known" tracking.
- 💬 **Document-Grounded Chat**: Per-document ChromaDB vector retrieval ensuring chat answers stay strictly grounded in your specific notes. Automatically flags out-of-scope questions.
- 💳 **Freemium & Razorpay Payments**: 3 free uploads/day quota reset daily at midnight IST. ₹199/month Pro tier upgrade via Razorpay checkout.
- 📈 **Progress Analytics**: Tracks materials studied, quiz score trends over time, and active study streaks.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  Upload UI / Summary / 10-MCQ Quiz / Flashcards / Chat / UX  │
└───────────────────────────┬────────────────────────────────┘
                            │ REST API (JWT Auth)
┌───────────────────────────▼────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Document Processor (PyMuPDF / Tesseract OCR)         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ RAG Vector Engine (Per-Document ChromaDB Collections)│   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ LLM Chain (Groq 70B → Groq 8B → Ollama / Fallback)   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Payment Service (Razorpay Webhook & Order Engine)    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Database (SQLAlchemy + SQLite / PostgreSQL Ready)    │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup

```bash
# Navigate to workspace
cd backend

# Install python dependencies
pip install -r requirements.txt

# Run backend server
python -m uvicorn backend.main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000`. API Documentation available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```
Frontend web app will be live at `http://localhost:5173`.

---

## 🧪 Automated Test Suite (26/26 Passing)

StudyMate AI includes a comprehensive 26-test automated suite covering unit, integration, RAG multi-tenant isolation, freemium limits, and payment idempotency.

Run the test suite:
```bash
python -m pytest backend/tests/test_all.py -v
```

### Test Coverage Summary

| Section | Scope | Test Cases | Status |
|---------|-------|------------|--------|
| 2.1 | Document Processing & OCR | Tests 1–6 | ✅ PASSED |
| 2.2 | Auth & Security | Tests 7–11 | ✅ PASSED |
| 2.3 | AI Generation (Summary/MCQ/Flashcard/Chat) | Tests 12–17 | ✅ PASSED |
| 2.4 | Freemium Daily Limits | Tests 18–21 | ✅ PASSED |
| 2.5 | Razorpay Payments & Webhooks | Tests 22–24 | ✅ PASSED |
| 2.6 | RAG Multi-Tenant & Per-Doc Isolation | Tests 25–26 | ✅ PASSED |

---

## 🌐 Production Deployment

- **Backend**: Hosted on Render Free Tier (`studymate-backend.onrender.com`)
- **Frontend**: Hosted on Vercel (`studymate.vercel.app`)

See [deployment/DEPLOY.md](file:///d:/studymate_ai/deployment/DEPLOY.md) for full production environment configuration details.

---

## 📄 License

MIT License — free for educational and portfolio demonstration use.
