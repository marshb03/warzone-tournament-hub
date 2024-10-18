# app/schemas/match.py
from pydantic import BaseModel
from typing import Optional

class MatchBase(BaseModel):
    tournament_id: int
    round: int
    match_number: int

class MatchCreate(MatchBase):
    team1_id: int
    team2_id: int

class MatchUpdate(BaseModel):
    winner_id: Optional[int] = None

class Match(MatchBase):
    id: int
    team1_id: int
    team2_id: int
    winner_id: Optional[int] = None

    class Config:
        from_attributes = True  # Changed from orm_mode = True

class MatchWithTeams(Match):
    team1: "Team"
    team2: "Team"
    winner: Optional["Team"] = None

    class Config:
        from_attributes = True  # Changed from orm_mode = True

from .team import Team  # This should be at the end to avoid circular imports
MatchWithTeams.model_rebuild()