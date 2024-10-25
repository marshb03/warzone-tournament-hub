# app/main.py
from fastapi import FastAPI
from .api.v1.api import api_router
from .core.config import settings
from .db.database import engine, Base
from app.models import Base, Tournament, Team, Match, LeaderboardEntry, User

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to the Warzone Tournament Hub API"}