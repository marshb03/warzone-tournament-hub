# app/schemas/player_ranking.py
from pydantic import BaseModel

class PlayerRankingBase(BaseModel):
    player_name: str
    twitter_handle: str
    rank: int

class PlayerRankingCreate(PlayerRankingBase):
    pass

class PlayerRankingUpdate(PlayerRankingBase):
    player_name: str | None = None
    twitter_handle: str | None = None
    rank: int | None = None

class PlayerRanking(PlayerRankingBase):
    id: int

    class Config:
        from_attributes = True