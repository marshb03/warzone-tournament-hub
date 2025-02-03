# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, Enum as SQLEnum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.models.base import Base

class UserRole(str, enum.Enum):
    USER = "USER"
    HOST = "HOST"
    SUPER_ADMIN = "SUPER_ADMIN"  # If you have this in a separate file

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(SQLEnum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())  
    

    # Add these relationships
    created_tournaments = relationship("Tournament", back_populates="creator")
    teams = relationship("Team", secondary="team_player", back_populates="players")
    activities = relationship("ActivityLog", back_populates="user")
    host_applications = relationship("HostApplication", back_populates="user")

    @property
    def is_superuser(self):
        """
        Maintain backward compatibility with existing code
        that checks is_superuser
        """
        return self.role == UserRole.SUPER_ADMIN