# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from .api.v1.api import api_router
from .core.config import settings
from .db.database import engine, Base
from app.models import Base, Tournament, Team, Match, LeaderboardEntry, User

logging.getLogger("multipart.multipart").setLevel(logging.ERROR)

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://bsrpgaming.com",
        "https://www.bsrpgaming.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
# Create database tables
Base.metadata.create_all(bind=engine)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to the Warzone Tournament Hub API"}