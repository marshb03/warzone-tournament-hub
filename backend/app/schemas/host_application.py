# app/schemas/host_application.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .user import UserInApplication
from app.models.host_application import ApplicationStatus

class HostApplicationBase(BaseModel):
    experience: str
    availability: str
    previous_experience: str
    additional_info: Optional[str] = None

class HostApplicationCreate(HostApplicationBase):
    pass

class HostApplicationUpdate(BaseModel):
    status: ApplicationStatus

class HostApplication(HostApplicationBase):
    id: int
    user_id: int
    status: ApplicationStatus
    created_at: datetime
    updated_at: datetime
    user: Optional[UserInApplication] = None

    class Config:
        from_attributes = True