# app/schemas/match.py
from pydantic import BaseModel
from typing import Optional, List

class MatchBase(BaseModel):
    tournament_id: int
    round: int
    match_number: int
    team1_id: Optional[int] = None
    team2_id: Optional[int] = None
    winner_id: Optional[int] = None
    loser_id: Optional[int] = None  # Added
    next_match_id: Optional[int] = None
    is_losers_bracket: bool = False  # Added

class MatchCreate(MatchBase):
    pass

class MatchUpdate(BaseModel):
    winner_id: Optional[int] = None

class Match(MatchBase):
    id: int

    class Config:
        from_attributes = True

class DoubleBracketResponse(BaseModel):
    tournament_id: int
    winners_bracket: List[Match]
    losers_bracket: List[Match]
    finals: List[Match]
    total_rounds: int

    class Config:
        from_attributes = True

class MatchWithTeams(Match):
    team1: "Team"
    team2: "Team"
    winner: Optional["Team"] = None

    class Config:
        from_attributes = True  # Changed from orm_mode = True

from .team import Team  # This should be at the end to avoid circular imports
MatchWithTeams.model_rebuild()