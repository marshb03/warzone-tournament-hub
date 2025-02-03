# app/models/host_profile.py
from sqlalchemy import Column, Integer, String, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.models.base import Base

class HostProfile(Base):
    __tablename__ = "host_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    banner_path = Column(String)
    description = Column(String)
    twitter_url = Column(String, nullable=True)
    discord_url = Column(String, nullable=True)
    
    # Relationship
    user = relationship("User", backref="host_profile", uselist=False)
    
    # Index for efficient lookups
    __table_args__ = (Index('idx_host_user_id', 'user_id'),)
