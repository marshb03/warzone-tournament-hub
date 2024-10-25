from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class MatchBase(BaseModel):
    tournament_id: int
    round: int
    match_number: int
    team1_id: Optional[int] = None
    team2_id: Optional[int] = None
    winner_id: Optional[int] = None
    next_match_id: Optional[int] = None

class MatchCreate(MatchBase):
    pass

class Match(MatchBase):
    id: int

    class Config:
        from_attributes = True

class BracketResponse(BaseModel):
    tournament_id: int
    matches: List[Match]
    total_rounds: int