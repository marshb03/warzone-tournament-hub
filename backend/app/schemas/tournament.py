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
    start_time: str | None = None  # Make nullable
    team_size: int | None = None   # Make nullable
    max_teams: int | None = None   # Make nullable
    current_teams: int = 0
    end_date: Optional[datetime] = None

class TournamentCreate(BaseModel):
    name: str
    format: TournamentFormat
    start_date: datetime
    start_time: str
    end_date: datetime
    team_size: int
    max_teams: int

class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    format: Optional[TournamentFormat] = None
    start_date: Optional[datetime] = None
    start_time: Optional[str] = None
    team_size: Optional[int] = None
    max_teams: Optional[int] = None
    end_date: Optional[datetime] = None

class Tournament(BaseModel):
    id: int
    name: str
    format: TournamentFormat
    start_date: datetime
    start_time: str | None
    end_date: datetime | None
    team_size: int | None
    max_teams: int | None
    current_teams: int = 0
    creator_id: int
    status: TournamentStatus
    creator_username: str | None = None  # Add this field

    class Config:
        from_attributes = True

class TournamentWithTeams(Tournament):
    teams: List["Team"] = []

    class Config:
        from_attributes = True

# Import this at the end to avoid circular imports
from .team import Team
TournamentWithTeams.model_rebuild()