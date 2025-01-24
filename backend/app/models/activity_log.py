# app/models/activity_log.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.models.base import Base

class ActivityType(str, enum.Enum):
    USER_CREATED = "USER_CREATED"
    USER_PROMOTED = "USER_PROMOTED"
    USER_DEMOTED = "USER_DEMOTED"
    USER_DEACTIVATED = "USER_DEACTIVATED"
    TOURNAMENT_CREATED = "TOURNAMENT_CREATED"
    TOURNAMENT_STARTED = "TOURNAMENT_STARTED"
    TOURNAMENT_COMPLETED = "TOURNAMENT_COMPLETED"
    TOURNAMENT_CANCELLED = "TOURNAMENT_CANCELLED"

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(Enum(ActivityType))
    description = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    target_id = Column(Integer)  # Can be user_id or tournament_id depending on activity
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to user who performed the action
    user = relationship("User", back_populates="activities")