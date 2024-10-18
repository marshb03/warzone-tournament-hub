# app/schemas/team.py
from pydantic import BaseModel
from typing import List, Optional

class TeamBase(BaseModel):
    name: str
    tournament_id: int

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: Optional[str] = None

class Team(TeamBase):
    id: int

    class Config:
        from_attributes = True  # Changed from orm_mode = True

class TeamWithPlayers(Team):
    players: List["User"] = []

    class Config:
        from_attributes = True  # Changed from orm_mode = True

from .user import User  # This should be at the end to avoid circular imports
TeamWithPlayers.model_rebuild()

class TeamInTournament(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True  # Changed from orm_mode = True