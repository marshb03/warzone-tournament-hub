from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    seed = Column(Integer)  # New column for team's seed number
    
    tournament = relationship("Tournament", back_populates="teams")
    matches_as_team1 = relationship("Match", foreign_keys="Match.team1_id", back_populates="team1")
    matches_as_team2 = relationship("Match", foreign_keys="Match.team2_id", back_populates="team2")
    matches_won = relationship("Match", foreign_keys="Match.winner_id", back_populates="winner")
    players = relationship("User", secondary="team_player", back_populates="teams")
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="team")