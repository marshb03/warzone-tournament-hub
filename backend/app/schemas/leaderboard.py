# app/schemas/leaderboard.py
from pydantic import BaseModel

class LeaderboardEntryBase(BaseModel):
    wins: int
    losses: int
    points: int

class LeaderboardEntryCreate(LeaderboardEntryBase):
    tournament_id: int
    team_id: int

class LeaderboardEntry(LeaderboardEntryBase):
    id: int
    tournament_id: int
    team_id: int

    class Config:
        from_attributes = True