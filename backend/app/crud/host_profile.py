# app/crud/host_profile.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Optional
from datetime import datetime, timedelta

from app.models.user import User, UserRole
from app.models.tournament import Tournament

class DailyHostStatsCache:
    _data: Optional[List[Dict]] = None
    _last_updated: Optional[datetime] = None
    _cache_duration = timedelta(days=1)  # Cache for 24 hours

    @classmethod
    def should_refresh(cls) -> bool:
        if cls._last_updated is None:
            return True
        return datetime.now() - cls._last_updated > cls._cache_duration

    @classmethod
    def get_cached_data(cls) -> Optional[List[Dict]]:
        if not cls.should_refresh():
            return cls._data
        return None

    @classmethod
    def set_cached_data(cls, data: List[Dict]):
        cls._data = data
        cls._last_updated = datetime.now()

def get_host_statistics(db: Session, user_id: int) -> Dict:
    """Get statistics for a specific host."""
    print(f"Getting statistics for host ID: {user_id}")  # Debug log
    
    tournaments_count = (
        db.query(func.count(Tournament.id))
        .filter(Tournament.creator_id == user_id)
        .scalar()
    )

    total_teams = (
        db.query(func.sum(Tournament.current_teams))
        .filter(Tournament.creator_id == user_id)
        .scalar() or 0
    )

    stats = {
        "tournaments_count": tournaments_count,
        "total_teams": total_teams
    }
    print(f"Host {user_id} stats: {stats}")  # Debug log
    return stats

def get_active_hosts_with_stats(db: Session) -> List[Dict]:
    """
    Get all active hosts with their statistics.
    Uses daily caching to minimize database queries.
    """
    print("Getting active hosts with stats")  # Debug log
    
    # Check cache first
    cached_data = DailyHostStatsCache.get_cached_data()
    if cached_data is not None:
        print("Returning cached data")  # Debug log
        return cached_data

    print("Cache miss, querying database")  # Debug log
    
    # Query for all active hosts
    hosts = (
        db.query(User)
        .filter(User.role == UserRole.HOST)
        .filter(User.is_active == True)
        .all()
    )

    print(f"Found {len(hosts)} active hosts")  # Debug log

    result = []
    for host in hosts:
        # Get statistics
        stats = get_host_statistics(db, host.id)
        
        host_data = {
            "id": host.id,
            "name": host.username,
            "tournaments_count": stats["tournaments_count"],
            "total_teams": stats["total_teams"]
        }
        result.append(host_data)

    print(f"Final result: {result}")  # Debug log
    
    # Update cache
    DailyHostStatsCache.set_cached_data(result)
    
    return result