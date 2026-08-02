# StudyMate AI — UI/UX Specification

## 1. Design Direction

Clean, focused, low-distraction — this is a study tool, not a marketing site. Calm color palette (avoid the aggressive dark-glassmorphism-with-neon-glow pattern used for Nomi; StudyMate should feel more like a quiet study room than a tech dashboard). Light mode primary (students study in daylight/library settings), with a dark mode toggle.

**Palette**: Warm off-white background (`#FAFAF7`), deep indigo primary (`#3730A3`) for actions, soft amber accent (`#F59E0B`) for highlights/streaks, calm green (`#10B981`) for correct answers, muted red (`#EF4444`) for incorrect — kept desaturated, not alarm-red.

**Typography**: Clean sans-serif (Inter or similar) for UI, slightly larger base font size than typical SaaS (16-18px) since this is read-heavy.

## 2. Pages

### 2.1 Landing / Login / Signup
- Simple hero: "Apna material upload karo, StudyMate baaki karega" (bilingual tagline)
- Signup/Login forms, minimal fields

### 2.2 Dashboard (Study Library)
- Grid of uploaded materials (cards): title, upload date, quiz best score badge
- Prominent "+ Upload New Material" button (top, always visible)
- Empty state (first-time user): friendly illustration + "Upload your first PDF or notes to get started"
- Free tier: small persistent badge showing "2/3 uploads left today"

### 2.3 Upload Flow
- Drag-and-drop zone + "Paste text instead" toggle
- On upload: processing state with the 4 stages (Extracting text → Understanding content → Generating summary → Creating quiz), similar spirit to Nomi's BuildingAnimation but calmer/simpler — a progress bar with stage labels, not elaborate node animations
- On complete: auto-navigate to Document Detail page

### 2.4 Document Detail (Core Screen)
Tab-based layout, four tabs:
- **Summary**: the generated summary, language toggle (EN/HI) top-right
- **Quiz**: MCQ interface, one question at a time, progress indicator (3/10), immediate feedback per answer, final score screen with review of wrong answers
- **Flashcards**: card carousel, tap/click to flip, swipe or arrow buttons to navigate, "mark as known" tracking
- **Chat**: standard chat interface, grounded in this document only, shows a small "based on your notes" indicator on responses that pulled from the document vs general knowledge

### 2.5 Progress Page
- Simple line/bar chart: quiz scores over time
- List of all materials with best scores
- Study streak counter (days active this week)

### 2.6 Upgrade / Billing
- Simple comparison: Free vs Pro (feature table)
- Razorpay checkout button
- Post-payment: confirmation screen, redirect to dashboard

## 3. Key Interaction Details

- **Bilingual toggle**: appears wherever content is language-sensitive (summary, MCQ questions) — not a global site-wide language switch, since a student might want English UI but Hindi summary content
- **Mobile-first for the quiz/flashcard views specifically** — these get used on-the-go between classes, must work smoothly on a phone browser even though V1 has no native app
- **Loading states**: never a blank screen during AI generation — always the staged progress indicator from 2.3

## 4. Component List (for Frontend Build)

```
components/
├── Navbar.jsx
├── UploadZone.jsx
├── ProcessingIndicator.jsx
├── DocumentCard.jsx
├── SummaryView.jsx
├── QuizPlayer.jsx
├── QuizResults.jsx
├── FlashcardDeck.jsx
├── ChatPanel.jsx
├── ProgressChart.jsx
├── UpgradeModal.jsx
└── LanguageToggle.jsx

pages/
├── Landing.jsx
├── Login.jsx
├── Signup.jsx
├── Dashboard.jsx
├── UploadFlow.jsx
├── DocumentDetail.jsx
├── Progress.jsx
└── Billing.jsx
```

## 5. Accessibility Notes

- All quiz/flashcard interactions keyboard-navigable (not just touch/click), since some users will be on laptops
- Sufficient color contrast for the calm palette (verify amber/green/red choices pass WCAG AA against the off-white background)
