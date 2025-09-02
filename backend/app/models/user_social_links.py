# app/models/user_social_links.py
from sqlalchemy import Column, Integer, String, ForeignKey, Index, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base

class SocialPlatform(str, enum.Enum):
    TWITTER = "twitter"
    TWITCH = "twitch"
    YOUTUBE = "youtube"
    DISCORD = "discord"
    INSTAGRAM = "instagram"
    TIKTOK = "tiktok"
    FACEBOOK = "facebook"
    KICK = "kick"

class UserSocialLink(Base):
    __tablename__ = "user_social_links"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform = Column(SQLEnum(SocialPlatform), nullable=False)
    username = Column(String, nullable=False)  # Username or handle
    url = Column(String, nullable=False)  # Full URL to profile
    
    # Relationship
    user = relationship("User", back_populates="social_links")
    
    # Ensure one link per platform per user
    __table_args__ = (
        Index('idx_user_platform_unique', 'user_id', 'platform', unique=True),
        Index('idx_user_social_links', 'user_id'),
    )