# app/main.py - Minimal update to add TKR auto-start
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import atexit

from .api.v1.api import api_router
from .core.config import settings
from .db.database import engine, Base

# Import all models to ensure they're registered
from app.models import (
    Base, Tournament, Team, Match, LeaderboardEntry, User, 
    HostProfile, UserSocialLink  # Add new models
)

# TKR Auto-start imports
try:
    from apscheduler.schedulers.background import BackgroundScheduler
    from app.services.tkr_auto_start import run_tkr_auto_start_check
    SCHEDULER_AVAILABLE = True
except ImportError:
    SCHEDULER_AVAILABLE = False
    print("APScheduler not installed. TKR auto-start disabled. Install with: pip install apscheduler")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global scheduler variable
scheduler = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events"""
    global scheduler
    
    # Startup
    logger.info("Starting up Tournament Hub API...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Start TKR auto-start scheduler if available
    if SCHEDULER_AVAILABLE:
        try:
            scheduler = BackgroundScheduler()
            scheduler.add_job(
                func=run_tkr_auto_start_check,
                trigger="interval",
                minutes=1,  # Check every minute
                id='tkr_auto_start',
                max_instances=1,
                coalesce=True,
                misfire_grace_time=30
            )
            scheduler.start()
            logger.info("TKR auto-start scheduler initialized")
        except Exception as e:
            logger.error(f"Failed to start TKR scheduler: {e}")
    else:
        logger.info("TKR auto-start scheduler disabled (APScheduler not available)")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Tournament Hub API...")
    if scheduler and scheduler.running:
        scheduler.shutdown()
        logger.info("TKR auto-start scheduler stopped")

# Create FastAPI app with lifespan management
app = FastAPI(
    title=settings.PROJECT_NAME, 
    version=settings.VERSION,
    lifespan=lifespan
)

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

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Health check endpoint (optional)
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    scheduler_status = "running" if scheduler and scheduler.running else "stopped" if SCHEDULER_AVAILABLE else "disabled"
    return {
        "status": "healthy",
        "scheduler_status": scheduler_status
    }

# Optional admin endpoints for monitoring (only if scheduler available)
if SCHEDULER_AVAILABLE:
    @app.get("/admin/scheduler/status")
    async def get_scheduler_status():
        """Get scheduler status"""
        if not scheduler:
            return {"status": "not_initialized"}
        
        jobs = []
        for job in scheduler.get_jobs():
            jobs.append({
                "id": job.id,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
            })
        
        return {
            "status": "running" if scheduler.running else "stopped",
            "jobs": jobs
        }

    @app.post("/admin/scheduler/run-now")
    async def run_scheduler_now():
        """Manually trigger TKR check"""
        try:
            result = run_tkr_auto_start_check()
            return {"success": True, "result": result}
        except Exception as e:
            return {"success": False, "error": str(e)}

@app.get("/")
def root():
    return {
        "message": "Welcome to the Warzone Tournament Hub API",
        "scheduler_enabled": SCHEDULER_AVAILABLE
    }

# Graceful shutdown handler
def shutdown_handler():
    """Handle graceful shutdown"""
    global scheduler
    if scheduler and scheduler.running:
        logger.info("Gracefully shutting down scheduler...")
        scheduler.shutdown(wait=True)

# Register shutdown handler
atexit.register(shutdown_handler)