# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # Add this import
from .api.v1.api import api_router
from .core.config import settings
from .db.database import engine, Base
from app.models import Base, Tournament, Team, Match, LeaderboardEntry, User

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Add CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your React app's URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to the Warzone Tournament Hub API"}