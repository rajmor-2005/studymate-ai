# StudyMate AI — Business Requirements Document (BRD)

## 1. Business Vision

Become the go-to AI study companion for Indian students and teachers — starting hyper-focused (Surat/Gujarat colleges), proving value with real users, then expanding. Secondary goal: this project itself functions as a portfolio/proof-of-skill asset for job and freelance opportunities in AI/ML engineering.

## 2. Revenue Model — Freemium

| Tier | Price | Limits |
|------|-------|--------|
| Free | ₹0 | 3 uploads/day, basic features |
| Pro | ₹199/month | Unlimited uploads, priority processing, export features |
| (Future) Institution | Custom | Bulk accounts for colleges/coaching centers |

**Payment gateway**: Razorpay (developer already has integration experience from prior projects)

## 3. Market Opportunity

- India has 250M+ students across school, college, and competitive exam segments
- Existing tools (Quizlet, Notion AI, Anki) are English-first, not built for Indian exam patterns or Hinglish study habits
- Zero-cost operational model (Groq free tier, local RAG) means the business can run profitably even at very low subscriber counts — no burn required to stay alive

## 4. Competitive Positioning

| Competitor | Gap StudyMate Fills |
|------------|---------------------|
| Quizlet | No Hinglish support, no Indian exam context |
| Notion AI | Not study-specific, expensive, no quiz generation |
| ChatGPT (manual use) | No structured flashcards/progress tracking, no persistent study library |

**StudyMate's edge**: India-first language handling + free-tier-only cost structure means sustainable low pricing competitors can't easily match.

## 5. Go-To-Market (V1, Low-Cost)

1. **Personal network**: Own MSc cohort, BSc IT alumni — first 20-30 users
2. **College outreach**: Direct pitch to 2-3 local Surat/Ahmedabad colleges — offer free access for feedback
3. **LinkedIn**: Build-in-public posts showing development progress — doubles as job/freelance visibility
4. **GitHub**: Open, well-documented repo — attracts both users and potential employers

## 6. Business Success Metrics (First 60 Days)

| Metric | Target |
|--------|--------|
| Total signups | 200+ |
| Paid conversions | 10+ (₹1,990+ MRR) |
| College partnerships (informal) | 2-3 |
| Job/freelance leads generated from project visibility | 3+ |

## 7. Cost Structure (V1)

| Item | Cost |
|------|------|
| Groq API | ₹0 (free tier) |
| Hosting (backend + frontend) | ₹0 (Render/Railway free tier) |
| Database | ₹0 (SQLite, file-based) |
| Domain (optional) | ~₹700/year (optional, can defer) |
| Razorpay | ₹0 setup, transaction fees only on actual payments |

**Total to launch: ₹0.** This is a deliberate constraint, not a limitation — proves the product can be built and run without external funding.

## 8. Risks

| Risk | Mitigation |
|------|-----------|
| Groq free tier rate limits under real load | Fallback chain to Ollama local already built (from Nomi project learnings) |
| Low initial conversion (freemium is hard) | Prioritize user count + testimonials first 60 days over revenue |
| Time constraint (MSc coursework starting) | Strict 2-week V1 scope, no feature creep |
