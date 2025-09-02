# app/api/v1/endpoints/social_links.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models
from app.api import deps
from app.models.user_social_links import SocialPlatform
from app.schemas.social_links import SocialLink, SocialLinkCreate, SocialLinkUpdate
from app.crud import social_links as crud

router = APIRouter()

@router.get("/", response_model=List[SocialLink])
def get_my_social_links(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Get current user's social links"""
    return crud.get_user_social_links(db, current_user.id)

@router.get("/{user_id}", response_model=List[SocialLink])
def get_user_social_links(
    user_id: int,
    db: Session = Depends(deps.get_db)
):
    """Get any user's social links (public endpoint for profiles/leaderboard)"""
    return crud.get_user_social_links(db, user_id)

@router.post("/", response_model=SocialLink)
def create_social_link(
    social_link: SocialLinkCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Create or update a social link for current user"""
    try:
        return crud.upsert_social_link(db, social_link, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{platform}", response_model=SocialLink)
def update_social_link(
    platform: SocialPlatform,
    social_link_update: SocialLinkUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Update a specific social link"""
    updated_link = crud.update_social_link(db, current_user.id, platform, social_link_update)
    if not updated_link:
        raise HTTPException(status_code=404, detail="Social link not found")
    return updated_link

@router.delete("/{platform}", response_model=SocialLink)
def delete_social_link(
    platform: SocialPlatform,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """Delete a social link"""
    deleted_link = crud.delete_social_link(db, current_user.id, platform)
    if not deleted_link:
        raise HTTPException(status_code=404, detail="Social link not found")
    return deleted_link

@router.get("/platforms/available")
def get_available_platforms():
    """Get list of available social media platforms"""
    return {
        "platforms": [
            {"value": "twitter", "label": "Twitter/X", "icon": "twitter"},
            {"value": "twitch", "label": "Twitch", "icon": "twitch"},
            {"value": "youtube", "label": "YouTube", "icon": "youtube"},
            {"value": "discord", "label": "Discord", "icon": "discord"},
            {"value": "instagram", "label": "Instagram", "icon": "instagram"},
            {"value": "tiktok", "label": "TikTok", "icon": "tiktok"},
            {"value": "facebook", "label": "Facebook", "icon": "facebook"},
            {"value": "kick", "label": "Kick", "icon": "kick"}
        ]
    }