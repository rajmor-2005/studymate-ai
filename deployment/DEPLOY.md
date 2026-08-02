# StudyMate AI — Production Deployment Guide

Zero-cost production deployment guide using Render (Backend) and Vercel (Frontend).

---

## 1. Backend Deployment (Render Free Tier)

1. **Connect Repository**:
   - Log into [Render Dashboard](https://dashboard.render.com/).
   - Click **New +** → **Web Service**.
   - Connect your GitHub repository containing `studymate_ai`.

2. **Service Configuration**:
   - **Name**: `studymate-backend`
   - **Environment**: `Python 3`
   - **Region**: Singapore or Frankfurt
   - **Branch**: `main`
   - **Root Directory**: `.`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**:
   Add the following variables in the Render Dashboard under **Environment**:
   - `DATABASE_URL`: `sqlite:///./studymate.db`
   - `JWT_SECRET`: `<generate-random-secret-key>`
   - `GROQ_API_KEY`: `<your-groq-api-key-from-console.groq.com>`
   - `GROQ_PRIMARY_MODEL`: `llama-3.3-70b-versatile`
   - `GROQ_FALLBACK_MODEL`: `llama-3.1-8b-instant`
   - `RAZORPAY_KEY_ID`: `<your-razorpay-key-id>`
   - `RAZORPAY_KEY_SECRET`: `<your-razorpay-key-secret>`
   - `FRONTEND_URL`: `https://studymate.vercel.app` (or your Vercel URL)

4. **Verify Backend Health**:
   Once deployed, navigate to `https://studymate-backend.onrender.com/api/health`. You should see `{"status":"ok","service":"StudyMate AI Backend"}`.

---

## 2. Frontend Deployment (Vercel Free Tier)

1. **Connect Repository**:
   - Log into [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **Add New...** → **Project**.
   - Select your `studymate_ai` GitHub repository.

2. **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment Variables**:
   - `VITE_API_URL`: `https://studymate-backend.onrender.com` (Your Render backend URL)

4. **Deploy**:
   Click **Deploy**. Vercel will build and serve your frontend across worldwide CDNs.
