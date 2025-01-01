# app/schemas/match.py
from pydantic import BaseModel
from typing import Optional, List, Dict
from .team_shared import TeamInMatch

class MatchBase(BaseModel):
    tournament_id: int
    round: int
    match_number: int
    team1_id: Optional[int] = None
    team2_id: Optional[int] = None
    winner_id: Optional[int] = None
    loser_id: Optional[int] = None
    next_match_id: Optional[int] = None
    bracket_position: Optional[int] = None
    has_bye: bool = False
    round_name: Optional[str] = None
    is_completed: bool = False

class MatchCreate(MatchBase):
    pass

class MatchUpdate(BaseModel):
    winner_id: Optional[int] = None

class Match(MatchBase):
    id: int
    team1: Optional[TeamInMatch] = None
    team2: Optional[TeamInMatch] = None
    winner: Optional[TeamInMatch] = None
    loser: Optional[TeamInMatch] = None

    class Config:
        from_attributes = True

# Separate schema for bracket responses
class BracketMatch(Match):
    # Include only the IDs of related matches to avoid recursion
    previous_match_ids: List[int] = []

    class Config:
        from_attributes = True

class BracketRound(BaseModel):
    round_number: int
    round_name: str
    matches: List[BracketMatch]

class BracketResponse(BaseModel):
    tournament_id: int
    rounds: List[BracketRound]
    total_rounds: int
    
    class Config:
        from_attributes = True

class TournamentBracketResponse(BaseModel):
    tournament_id: int
    winners_bracket: List[BracketMatch]
    finals: List[BracketMatch]
    total_rounds: int

    class Config:
        from_attributes = True