# StudyMate AI — Functional Requirements Document (FRD)

## 1. Authentication

### 1.1 Signup
- **User story**: As a new user, I can sign up with email + password.
- **Fields**: email, password, name
- **Validation**: valid email format, password min 8 chars
- **Output**: JWT token, redirect to dashboard

### 1.2 Login
- **User story**: As a returning user, I can log in with email + password.
- **Edge case**: wrong password → clear error, no indication of whether email exists (security)

## 2. Document Upload

### 2.1 Upload Material
- **User story**: As a student, I can upload a PDF, image, or paste text to turn into study material.
- **Accepted formats**: `.pdf`, `.jpg`, `.jpeg`, `.png`, plain text paste
- **Max file size**: 10MB (keeps processing fast, fits free-tier constraints)
- **Processing**:
  - PDF → extract text (PyMuPDF)
  - Image → OCR extract text (Tesseract)
  - Text paste → used directly
- **Edge case**: scanned PDF with no extractable text → auto-fallback to OCR on rendered pages
- **Edge case**: unsupported file type → clear error before upload attempt

### 2.2 Upload Limits (Freemium)
- **User story**: As a free user, I'm limited to 3 uploads/day; as a paid user, unlimited.
- **Behavior**: on 4th upload attempt (free tier), show upgrade prompt with Razorpay checkout link
- Limit resets daily at midnight IST

## 3. AI Processing

### 3.1 Summary Generation
- **User story**: As a student, I get a clear summary of my uploaded material.
- **Output**: 150-300 word summary, structured with headers if source material has clear sections
- **Language**: auto-detect majority language of source; offer toggle between English/Hindi summary

### 3.2 MCQ Generation
- **User story**: As a student, I get practice questions to test myself.
- **Output**: 10 MCQs (4 options each, 1 correct), difficulty mixed (easy/medium/hard)
- **Behavior**: user answers → immediate score + review of wrong answers with explanation

### 3.3 Flashcard Generation
- **User story**: As a student, I get flashcards for quick revision.
- **Output**: 10-15 flashcards (term/question on front, answer on back)
- **Interaction**: click/tap to flip, swipe or button to mark "known"/"review again"

### 3.4 Chat With Notes
- **User story**: As a student, I can ask follow-up questions about my uploaded material and get answers grounded in it.
- **Behavior**: RAG-retrieval scoped to the specific uploaded document (not global knowledge base), so answers stay relevant to what was actually uploaded
- **Edge case**: question outside the document's scope → model says so honestly, offers general knowledge as a clearly-labeled separate answer rather than pretending it's from the document

## 4. Progress Tracking

### 4.1 Study Library
- **User story**: As a user, I can see all my past uploaded materials in one place.
- **Fields shown**: title (auto-generated from content), upload date, quiz best score

### 4.2 Quiz History
- **User story**: As a user, I can see how I've scored on quizzes over time.
- **Output**: simple list/chart of scores per material, retake option

## 5. Payments

### 5.1 Upgrade to Pro
- **User story**: As a free user hitting limits, I can upgrade via Razorpay.
- **Flow**: click upgrade → Razorpay checkout → webhook confirms payment → account flagged as Pro
- **Edge case**: payment fails → clear retry option, account stays on free tier, no partial state

### 5.2 Manage Subscription
- **User story**: As a Pro user, I can see my subscription status and cancel if needed.

## 6. Non-Functional (Cross-Cutting)

- All AI-facing errors (Groq timeout, rate limit) show a friendly retry message, never raw stack traces
- All pages responsive down to mobile browser width (375px)
- Bilingual UI labels where practical (English primary, Hindi toggle for key actions)
