# app/crud/social_links.py
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.user_social_links import UserSocialLink, SocialPlatform
from app.schemas.social_links import SocialLinkCreate, SocialLinkUpdate, generate_social_url

def get_user_social_links(db: Session, user_id: int) -> List[UserSocialLink]:
    """Get all social links for a user"""
    return db.query(UserSocialLink).filter(UserSocialLink.user_id == user_id).all()

def get_social_link(db: Session, user_id: int, platform: SocialPlatform) -> Optional[UserSocialLink]:
    """Get specific social link by user and platform"""
    return db.query(UserSocialLink).filter(
        UserSocialLink.user_id == user_id,
        UserSocialLink.platform == platform
    ).first()

def create_social_link(db: Session, social_link: SocialLinkCreate, user_id: int) -> UserSocialLink:
    """Create a new social link"""
    # Generate URL if not provided
    url = social_link.url
    if not url or url.strip() == "":
        url = generate_social_url(social_link.platform, social_link.username)
    
    db_link = UserSocialLink(
        user_id=user_id,
        platform=social_link.platform,
        username=social_link.username,
        url=url
    )
    
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link

def update_social_link(
    db: Session, 
    user_id: int, 
    platform: SocialPlatform, 
    social_link_update: SocialLinkUpdate
) -> Optional[UserSocialLink]:
    """Update existing social link"""
    db_link = get_social_link(db, user_id, platform)
    if not db_link:
        return None
    
    update_data = social_link_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_link, field, value)
    
    # Regenerate URL if username changed but URL wasn't provided
    if 'username' in update_data and 'url' not in update_data:
        db_link.url = generate_social_url(platform, db_link.username)
    
    db.commit()
    db.refresh(db_link)
    return db_link

def delete_social_link(db: Session, user_id: int, platform: SocialPlatform) -> Optional[UserSocialLink]:
    """Delete a social link"""
    db_link = get_social_link(db, user_id, platform)
    if not db_link:
        return None
    
    db.delete(db_link)
    db.commit()
    return db_link

def upsert_social_link(db: Session, social_link: SocialLinkCreate, user_id: int) -> UserSocialLink:
    """Create or update a social link"""
    existing_link = get_social_link(db, user_id, social_link.platform)
    
    if existing_link:
        # Update existing link
        update_data = SocialLinkUpdate(
            username=social_link.username,
            url=social_link.url
        )
        return update_social_link(db, user_id, social_link.platform, update_data)
    else:
        # Create new link
        return create_social_link(db, social_link, user_id)