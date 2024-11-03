# app/schemas/losers_match.py
from pydantic import BaseModel
from typing import Optional, List
from .match import Match  # Import Match schema

class LosersMatchBase(BaseModel):
    tournament_id: int
    round: int
    match_number: int
    team1_id: Optional[int] = None
    team2_id: Optional[int] = None
    winner_id: Optional[int] = None
    next_match_id: Optional[int] = None
    dropped_from_match_id: Optional[int] = None

class LosersMatchCreate(LosersMatchBase):
    pass

class LosersMatch(LosersMatchBase):
    id: int

    class Config:
        from_attributes = True

class DoubleBracketResponse(BaseModel):
    tournament_id: int
    winners_bracket: List[Match]  # Now Match is properly imported
    losers_bracket: List[LosersMatch]
    finals: List[Match]
    total_rounds: int

    class Config:
        from_attributes = True