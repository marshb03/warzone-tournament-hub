# app/schemas/host_profile.py
from pydantic import BaseModel, HttpUrl
from typing import Optional

class HostProfileBase(BaseModel):
    banner_path: str
    description: str
    twitter_url: Optional[str] = None
    discord_url: Optional[str] = None

class HostProfileCreate(HostProfileBase):
    user_id: int

class HostProfileUpdate(BaseModel):
    banner_path: Optional[str] = None
    description: Optional[str] = None
    twitter_url: Optional[str] = None
    discord_url: Optional[str] = None

class HostProfile(HostProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Schema for host statistics response
class HostStatistics(BaseModel):
    tournaments_count: int = 0
    total_teams: int = 0