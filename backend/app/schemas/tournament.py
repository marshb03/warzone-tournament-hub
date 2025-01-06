# app/schemas/tournament.py
from pydantic import BaseModel, validator
from datetime import datetime
from typing import List, Optional, Dict
from enum import Enum
from .user import UserInTournament 
class TournamentFormat(str, Enum):
    SINGLE_ELIMINATION = "SINGLE_ELIMINATION"
    DOUBLE_ELIMINATION = "DOUBLE_ELIMINATION"
    
class TournamentStatus(str, Enum):
    PENDING = "PENDING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class LeaderboardEntryBase(BaseModel):
    wins: int = 0
    losses: int = 0
    points: int = 0

class LeaderboardEntry(LeaderboardEntryBase):
    id: int
    team_id: int

    class Config:
        from_attributes = True

class TournamentBracketConfig(BaseModel):
    seeding_type: str = "standard"  # standard, random, manual
    handle_byes: str = "high_seed"  # high_seed, random, manual
    round_names: Dict[int, str] = {
        1: "Round 1",
        2: "Quarter Finals",
        3: "Semi Finals",
        4: "Finals"
    }

class TournamentBase(BaseModel):
    name: str
    format: TournamentFormat
    start_date: datetime
    start_time: Optional[str] = None
    team_size: Optional[int] = None
    max_teams: Optional[int] = None
    current_teams: int = 0
    end_date: Optional[datetime] = None
    bracket_config: Optional[TournamentBracketConfig] = None
    description: Optional[str] = None
    rules: Optional[str] = None

    @validator('team_size')
    def validate_team_size(cls, v):
        if v is not None and v < 1:
            raise ValueError('Team size must be at least 1')
        return v

    @validator('max_teams')
    def validate_max_teams(cls, v):
        if v is not None:
            if v < 4:
                raise ValueError('Tournament must allow at least 4 teams')
            if v > 32:
                raise ValueError('Tournament cannot have more than 32 teams')
        return v

class TournamentCreate(BaseModel):
    name: str
    format: TournamentFormat
    start_date: datetime
    start_time: str
    end_date: datetime
    team_size: int
    max_teams: int
    bracket_config: Optional[TournamentBracketConfig] = None
    description: Optional[str] = None
    rules: Optional[str] = None

class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    format: Optional[TournamentFormat] = None
    start_date: Optional[datetime] = None
    start_time: Optional[str] = None
    team_size: Optional[int] = None
    max_teams: Optional[int] = None
    end_date: Optional[datetime] = None
    bracket_config: Optional[TournamentBracketConfig] = None
    description: Optional[str] = None
    rules: Optional[str] = None

    @validator('team_size')
    def validate_team_size_update(cls, v):
        if v is not None and v < 1:
            raise ValueError('Team size must be at least 1')
        return v

    @validator('max_teams')
    def validate_max_teams_update(cls, v):
        if v is not None:
            if v < 4:
                raise ValueError('Tournament must allow at least 4 teams')
            if v > 32:
                raise ValueError('Tournament cannot have more than 32 teams')
        return v
class Tournament(BaseModel):
    id: int
    name: str
    format: TournamentFormat
    start_date: datetime
    start_time: Optional[str]
    end_date: Optional[datetime]
    team_size: Optional[int]
    max_teams: Optional[int]
    current_teams: int = 0
    creator_id: int
    creator: Optional[UserInTournament] = None
    status: TournamentStatus
    creator_username: Optional[str] = None
    bracket_config: Optional[TournamentBracketConfig] = None
    description: Optional[str] = None
    rules: Optional[str] = None

    @validator('creator_username', always=True)
    def get_creator_username(cls, v, values):
        if values.get('creator'):
            return values['creator'].username
        return v

    class Config:
        from_attributes = True

class TournamentWithTeams(Tournament):
    teams: List["Team"] = []

    class Config:
        from_attributes = True

# Import this at the end to avoid circular imports
from .team import Team
TournamentWithTeams.model_rebuild()