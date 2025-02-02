# app/api/v1/endpoints/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict
from datetime import datetime, timedelta
import psutil

from app.api import deps
from app.models.user import User, UserRole
from app.models.tournament import Tournament, TournamentStatus

router = APIRouter()

@router.get("/stats")
async def get_admin_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_super_admin)
) -> Dict:
    """
    Get statistics for the admin dashboard.
    Only accessible by super admin.
    """
    # Get total users count
    total_users = db.query(func.count(User.id)).scalar()

    # Get active users (is_active = True)
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()

    # Get total hosts count
    total_hosts = db.query(func.count(User.id)).filter(User.role == UserRole.HOST).scalar()

    # Get active tournaments count
    active_tournaments = db.query(func.count(Tournament.id))\
        .filter(Tournament.status == TournamentStatus.ONGOING)\
        .scalar()
    
    # Get tournaments by status
    tournament_stats = db.query(
        Tournament.status,
        func.count(Tournament.id)
    ).group_by(Tournament.status).all()
    
    tournament_by_status = {
        status.value: count for status, count in tournament_stats
    }

    # Get tournament format statistics
    format_stats = db.query(
        Tournament.format,
        func.count(Tournament.id).label('count')
    ).group_by(Tournament.format).all()

    total_tournaments = sum(count for _, count in format_stats)
    popular_format = None
    popular_format_percentage = 0

    if format_stats:
        # Find the most popular format
        popular_format_data = max(format_stats, key=lambda x: x[1])
        popular_format = popular_format_data[0].value.replace('_', ' ')
        if total_tournaments > 0:
            popular_format_percentage = round((popular_format_data[1] / total_tournaments) * 100)

    # Get recent users (last 5 users who joined)
    recent_users = db.query(User)\
        .order_by(User.created_at.desc())\
        .limit(5)\
        .all()

    # Get system health metrics
    cpu_usage = psutil.cpu_percent()
    memory = psutil.virtual_memory()

    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "totalHosts": total_hosts,
        "activeTournaments": active_tournaments,
        "tournamentsByStatus": tournament_by_status,
        "systemHealth": {
            "cpuUsage": cpu_usage,
            "memoryUsage": memory.percent,
            "memoryTotal": memory.total,
            "memoryAvailable": memory.available
        },
        "popularFormat": popular_format,
        "popularFormatPercentage": popular_format_percentage,
        "recentUsers": [
            {
                "username": user.username,
                "created_at": user.created_at,
                "is_active": user.is_active
            } for user in recent_users
        ],
        "pageViews": 0,  # This would need to be implemented with actual tracking
        "recordedAt": datetime.utcnow().isoformat()
    }
    
@router.get("/users")
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_super_admin)
):
    """Get all users for admin management."""
    users = db.query(User).offset(skip).limit(limit).all()
    return users