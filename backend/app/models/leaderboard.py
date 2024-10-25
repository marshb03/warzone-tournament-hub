from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    team_id = Column(Integer, ForeignKey("teams.id"))
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    points = Column(Integer, default=0)

    tournament = relationship("Tournament", back_populates="leaderboard_entries")
    team = relationship("Team", back_populates="leaderboard_entries")