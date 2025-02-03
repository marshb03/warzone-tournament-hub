# app/models/host_application.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.models.base import Base

class ApplicationStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class HostApplication(Base):
    __tablename__ = "host_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    experience = Column(String)
    availability = Column(String)
    previous_experience = Column(String)
    additional_info = Column(String, nullable=True)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="host_applications")