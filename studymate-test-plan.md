# StudyMate AI — Test Plan

## 1. Test Categories

| Category | Coverage |
|----------|----------|
| Unit | Document processing (PDF/OCR extraction), auth logic |
| Integration | API endpoints, RAG pipeline per-document collections |
| End-to-End | Full user flows (upload → summary → quiz → chat) |
| Manual/Exploratory | AI output quality (summary/MCQ usefulness) |

## 2. Automated Test Cases

### 2.1 Document Processing
| # | Test | Expected |
|---|------|----------|
| 1 | Upload valid PDF with extractable text | Text extracted successfully, matches expected content |
| 2 | Upload scanned/image-only PDF | Falls back to OCR, extracts readable text |
| 3 | Upload image (photographed notes) | OCR extracts text |
| 4 | Upload file >10MB | Rejected with clear error before processing |
| 5 | Upload unsupported file type (.docx) | Rejected with clear error |
| 6 | Paste plain text directly | Processed same as extracted text |

### 2.2 Auth
| # | Test | Expected |
|---|------|----------|
| 7 | Signup with valid email/password | Account created, JWT returned |
| 8 | Signup with existing email | Clear error, no account created |
| 9 | Login with correct credentials | JWT returned |
| 10 | Login with wrong password | Generic error (no email-existence leak) |
| 11 | Access protected endpoint without token | 401 returned |

### 2.3 AI Generation
| # | Test | Expected |
|---|------|----------|
| 12 | Generate summary for English document | Coherent 150-300 word summary |
| 13 | Generate summary for Hindi/Hinglish document | Correctly handles mixed language, doesn't garble |
| 14 | Generate MCQs | Exactly 10 questions, each with 4 options, 1 correct answer marked |
| 15 | Generate flashcards | 10-15 cards, front/back both populated, no empty cards |
| 16 | Chat question directly answerable from document | Response grounded in document content |
| 17 | Chat question NOT covered in document | Model honestly says so, doesn't fabricate a grounded-sounding answer |

### 2.4 Freemium Limits
| # | Test | Expected |
|---|------|----------|
| 18 | Free user uploads 3 documents in a day | All 3 succeed |
| 19 | Free user attempts 4th upload same day | Blocked, upgrade prompt shown |
| 20 | Upload count resets after midnight IST | 4th upload succeeds next day |
| 21 | Pro user uploads more than 3 in a day | No limit applied |

### 2.5 Payments
| # | Test | Expected |
|---|------|----------|
| 22 | Successful Razorpay payment | User tier upgraded to 'pro', webhook processed correctly |
| 23 | Failed payment | User remains on 'free' tier, no partial state |
| 24 | Webhook replay (duplicate event) | Idempotent — doesn't double-charge or double-upgrade |

### 2.6 RAG Isolation (Critical — Multi-Tenant Correctness)
| # | Test | Expected |
|---|------|----------|
| 25 | User A's chat query | Only retrieves from User A's document collection, never User B's |
| 26 | Two documents from the same user, different topics | Chat on Document 1 never retrieves content from Document 2 |

## 3. Manual Verification Flow (Run Before Any Deploy)

1. Sign up → upload a real PDF (e.g. an actual class note) → verify summary reads naturally, not robotic
2. Take the generated quiz → verify questions are actually about the uploaded content, not generic
3. Flip through flashcards → verify no duplicate or nonsensical cards
4. Ask the chat a specific question about the document → verify grounded response
5. Ask the chat something unrelated → verify honest "not in this document" response
6. Hit the free tier upload limit → verify upgrade prompt appears correctly
7. Complete a test Razorpay payment (test mode) → verify tier upgrades, limit removed
8. Check the whole flow on a mobile browser (not just desktop) — quiz and flashcards specifically

## 4. Production Readiness Checklist (Before Public Launch)

- [ ] All 26 automated tests passing
- [ ] Manual verification flow completed without issues
- [ ] Environment variables set correctly in Render + Vercel (not hardcoded anywhere in code)
- [ ] `.env` file confirmed in `.gitignore` — no secrets committed to GitHub
- [ ] CORS configured correctly (frontend URL whitelisted on backend)
- [ ] Razorpay in live mode (not test mode) with real keys before accepting real payments
- [ ] Basic error monitoring confirmed working (check Render logs show errors clearly)
- [ ] Tested with at least 3 real documents from different subjects (not just one test PDF)
