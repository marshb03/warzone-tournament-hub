# app/schemas/leaderboard.py
from pydantic import BaseModel

class LeaderboardEntry(BaseModel):
    id: int
    tournament_id: int
    team_id: int
    wins: int
    losses: int
    points: int

    class Config:
        from_attributes = True

class LeaderboardEntryCreate(LeaderboardEntry):
    tournament_id: int
    team_id: int

class LeaderboardEntry(LeaderboardEntry):
    id: int
    tournament_id: int
    team_id: int

    class Config:
        from_attributes = True