# app/schemas/losers_match.py
from pydantic import BaseModel, validator, model_validator
from typing import Optional, List, Dict
from .match import Match
from .team_shared import TeamInMatch

class LosersMatchBase(BaseModel):
    tournament_id: int
    round: int
    match_number: int
    team1_id: Optional[int] = None
    team2_id: Optional[int] = None
    winner_id: Optional[int] = None
    next_match_id: Optional[int] = None
    
    # Source tracking fields
    team1_from_winners: bool = True
    team1_winners_round: Optional[int] = None
    team1_winners_match_number: Optional[int] = None
    
    team2_from_winners: bool = True
    team2_winners_round: Optional[int] = None
    team2_winners_match_number: Optional[int] = None

class LosersMatchCreate(LosersMatchBase):
    pass

class LosersMatch(LosersMatchBase):
    id: int
    team1: Optional[TeamInMatch] = None
    team2: Optional[TeamInMatch] = None
    winner: Optional[TeamInMatch] = None
    class Config:
        from_attributes = True

class DoubleBracketResponse(BaseModel):
    tournament_id: int
    winners_bracket: List[Match]
    losers_bracket: List[LosersMatch]
    finals: List[Match]
    total_rounds: int

    class Config:
        from_attributes = True