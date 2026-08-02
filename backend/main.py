from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import FRONTEND_URL
from backend.core.database import engine, Base
import backend.models  # Ensures all models are registered

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StudyMate AI API",
    description="Bilingual AI Study Companion API",
    version="1.0.0"
)

# Configure CORS
origins = [
    FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"  # Allows easy testing in development/staging
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from backend.routers import auth, documents, payments, progress
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(payments.router)
app.include_router(progress.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "StudyMate AI Backend"}
