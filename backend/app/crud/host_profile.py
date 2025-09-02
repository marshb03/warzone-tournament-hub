# app/crud/host_profile.py - Update the get_active_hosts_with_stats function
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Optional
from datetime import datetime, timedelta

from app.models.user import User, UserRole
from app.models.tournament import Tournament
from app.models.host_profile import HostProfile
from app.models.user_social_links import UserSocialLink, SocialPlatform
from app.schemas.host_profile import HostProfileCreate, HostProfileUpdate, LogoUpdate

class DailyHostStatsCache:
    _data: Optional[List[Dict]] = None
    _last_updated: Optional[datetime] = None
    _cache_duration = timedelta(hours=1)  # Reduced to 1 hour for more dynamic updates

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
    return stats

def get_host_social_links(db: Session, user_id: int) -> Dict[str, str]:
    """Get Twitter and Discord links for a host"""
    social_links = (
        db.query(UserSocialLink)
        .filter(
            UserSocialLink.user_id == user_id,
            UserSocialLink.platform.in_([SocialPlatform.TWITTER, SocialPlatform.DISCORD])
        )
        .all()
    )
    
    links = {}
    for link in social_links:
        if link.platform == SocialPlatform.TWITTER:
            links["twitter"] = link.url
        elif link.platform == SocialPlatform.DISCORD:
            links["discord"] = link.url
    
    return links

def get_active_hosts_with_stats(db: Session) -> List[Dict]:
    """
    Get all active hosts with their statistics, logos, and social links.
    Uses caching to minimize database queries.
    """
    
    # Check cache first
    cached_data = DailyHostStatsCache.get_cached_data()
    if cached_data is not None:
        return cached_data

    # Query for all active hosts with their profiles
    hosts_query = (
        db.query(User, HostProfile)
        .outerjoin(HostProfile, User.id == HostProfile.user_id)
        .filter(User.role == UserRole.HOST)
        .filter(User.is_active == True)
        .all()
    )

    result = []
    for host, profile in hosts_query:
        # Get statistics
        stats = get_host_statistics(db, host.id)
        
        # Get social links (Twitter and Discord only)
        social_links = get_host_social_links(db, host.id)
        
        host_data = {
            "id": host.id,
            "name": profile.organization_name if profile and profile.organization_name else host.username,
            "description": profile.description if profile else None,
            "tournaments_count": stats["tournaments_count"],
            "total_teams": stats["total_teams"],
            # Logo information
            "logo_url": profile.logo_url if profile else None,
            "logo_public_id": profile.logo_public_id if profile else None,
            # Social links (only Twitter and Discord)
            "twitter_url": social_links.get("twitter"),
            "discord_url": social_links.get("discord")
        }
        result.append(host_data)
    
    # Update cache
    DailyHostStatsCache.set_cached_data(result)
    
    return result

# Keep all your existing CRUD functions unchanged...
def get_host_profile(db: Session, user_id: int) -> Optional[HostProfile]:
    """Get host profile by user ID"""
    return db.query(HostProfile).filter(HostProfile.user_id == user_id).first()

def create_host_profile(db: Session, profile: HostProfileCreate) -> HostProfile:
    """Create a new host profile"""
    db_profile = HostProfile(**profile.dict())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def update_host_profile(db: Session, user_id: int, profile_update: HostProfileUpdate) -> Optional[HostProfile]:
    """Update host profile"""
    db_profile = get_host_profile(db, user_id)
    if not db_profile:
        return None
    
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

def update_host_logo(db: Session, user_id: int, logo_data: LogoUpdate) -> Optional[HostProfile]:
    """Update host logo specifically"""
    db_profile = get_host_profile(db, user_id)
    
    # Create profile if it doesn't exist
    if not db_profile:
        profile_data = HostProfileCreate(
            user_id=user_id,
            organization_name="Default Organization",  # This should be updated
            banner_path="",
            description="",
            logo_url=logo_data.logo_url,
            logo_public_id=logo_data.logo_public_id
        )
        return create_host_profile(db, profile_data)
    
    # Update existing profile
    db_profile.logo_url = logo_data.logo_url
    db_profile.logo_public_id = logo_data.logo_public_id
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

def remove_host_logo(db: Session, user_id: int) -> Optional[HostProfile]:
    """Remove host logo"""
    db_profile = get_host_profile(db, user_id)
    if not db_profile:
        return None
    
    old_public_id = db_profile.logo_public_id  # For cleanup if needed
    db_profile.logo_url = None
    db_profile.logo_public_id = None
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

def delete_host_profile(db: Session, user_id: int) -> Optional[HostProfile]:
    """Delete host profile"""
    db_profile = get_host_profile(db, user_id)
    if not db_profile:
        return None
    
    db.delete(db_profile)
    db.commit()
    return db_profile