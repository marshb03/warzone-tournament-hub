# app/models/host_profile.py
from sqlalchemy import Column, Integer, String, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.models.base import Base

class HostProfile(Base):
    __tablename__ = "host_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Basic profile info - now optional
    banner_path = Column(String, nullable=True)
    description = Column(String, nullable=True)
    
    # Organization info - now required
    organization_name = Column(String, nullable=False)
    
    # Logo fields
    logo_url = Column(String, nullable=True)
    logo_public_id = Column(String, nullable=True)
    
    # Deprecated social media fields (keeping for migration compatibility)
    twitter_url = Column(String, nullable=True)
    discord_url = Column(String, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="host_profile", uselist=False)
    
    # Index for efficient lookups
    __table_args__ = (Index('idx_host_user_id', 'user_id'),)