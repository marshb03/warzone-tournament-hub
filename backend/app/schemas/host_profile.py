# app/schemas/host_profile.py
from pydantic import BaseModel, HttpUrl
from typing import Optional

class HostProfileBase(BaseModel):
    organization_name: str
    banner_path: Optional[str] = None
    description: Optional[str] = None
    # Keep legacy fields for backward compatibility
    twitter_url: Optional[str] = None
    discord_url: Optional[str] = None
    # Logo fields
    logo_url: Optional[str] = None
    logo_public_id: Optional[str] = None

class HostProfileCreate(HostProfileBase):
    user_id: int

class HostProfileUpdate(BaseModel):
    organization_name: Optional[str] = None
    banner_path: Optional[str] = None
    description: Optional[str] = None
    twitter_url: Optional[str] = None
    discord_url: Optional[str] = None
    logo_url: Optional[str] = None
    logo_public_id: Optional[str] = None

# New schema specifically for logo updates
class LogoUpdate(BaseModel):
    logo_url: str
    logo_public_id: str

class HostProfile(HostProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Schema for host statistics response
class HostStatistics(BaseModel):
    tournaments_count: int = 0
    total_teams: int = 0