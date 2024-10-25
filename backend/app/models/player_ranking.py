# app/models/player_ranking.py
from sqlalchemy import Column, Integer, String
from app.models.base import Base

class PlayerRanking(Base):
    __tablename__ = "player_rankings"

    id = Column(Integer, primary_key=True, index=True)
    player_name = Column(String, index=True)
    twitter_handle = Column(String, index=True)
    rank = Column(Integer, index=True)