# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging
from .api.v1.api import api_router
from .core.config import settings
from .db.database import engine, Base
from app.models import Base, Tournament, Team, Match, LeaderboardEntry, User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Add middleware to log requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    logger.info(f"Origin: {request.headers.get('origin')}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# Your existing CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://bsrpgaming.com",
        "https://www.bsrpgaming.com",
        "https://warzone-tournament-hub-production.up.railway.app"
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