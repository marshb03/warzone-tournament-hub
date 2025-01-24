# app/models/user.py
from sqlalchemy import Boolean, Column, Integer, String, Enum
from sqlalchemy.orm import relationship
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
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)

    # Add these relationships
    created_tournaments = relationship("Tournament", back_populates="creator")
    teams = relationship("Team", secondary="team_player", back_populates="players")
    activities = relationship("ActivityLog", back_populates="user")  # Add this line

    @property
    def is_superuser(self):
        """
        Maintain backward compatibility with existing code
        that checks is_superuser
        """
        return self.role == UserRole.SUPER_ADMIN