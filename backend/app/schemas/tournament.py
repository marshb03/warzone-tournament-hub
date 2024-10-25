# app/schemas/tournament.py
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from enum import Enum

class TournamentFormat(str, Enum):
    SINGLE_ELIMINATION = "SINGLE_ELIMINATION"
    DOUBLE_ELIMINATION = "DOUBLE_ELIMINATION"
    
class TournamentStatus(str, Enum):
    PENDING = "PENDING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class LeaderboardEntryBase(BaseModel):
    wins: int
    losses: int
    points: int

class LeaderboardEntry(LeaderboardEntryBase):
    id: int
    team_id: int

    class Config:
        from_attributes = True

class TournamentBase(BaseModel):
    name: str
    format: TournamentFormat
    start_date: datetime
    end_date: Optional[datetime] = None

class TournamentCreate(BaseModel):
    name: str
    format: TournamentFormat
    start_date: datetime
    end_date: datetime

class TournamentUpdate(TournamentBase):
    pass

class Tournament(TournamentCreate):
    id: int
    creator_id: int
    status: TournamentStatus

    class Config:
        from_attributes = True

class TournamentWithTeams(Tournament):
    teams: List["Team"] = []

    class Config:
        from_attributes = True

# Import this at the end to avoid circular imports
from .team import Team
TournamentWithTeams.model_rebuild()