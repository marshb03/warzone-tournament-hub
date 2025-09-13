# app/schemas/team.py - Updated with creator_id support
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TeamBase(BaseModel):
    name: str
    tournament_id: int

class TeamCreate(TeamBase):
    creator_id: Optional[int] = None  # NEW: Optional creator ID

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    creator_id: Optional[int] = None  # NEW: Allow updating creator

class Team(TeamBase):
    id: int
    seed: Optional[int] = None
    creator_id: Optional[int] = None  # NEW: Include creator_id in response
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Changed from orm_mode = True

class TeamWithPlayers(Team):
    players: List["User"] = []

    class Config:
        from_attributes = True  # Changed from orm_mode = True

class TeamInTournament(BaseModel):
    id: int
    name: str
    creator_id: Optional[int] = None  # NEW: Include creator info

    class Config:
        from_attributes = True  # Changed from orm_mode = True

from .user import User  # This should be at the end to avoid circular imports
TeamWithPlayers.model_rebuild()