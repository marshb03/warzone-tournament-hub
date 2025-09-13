# app/models/team.py - Fixed version without relationship conflicts
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base
from datetime import datetime

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    seed = Column(Integer, nullable=True)  # For bracket seeding
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # NEW: Track team creator
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships - RESTORED original working relationships + new creator relationship
    tournament = relationship("Tournament", back_populates="teams")
    creator = relationship("User", foreign_keys=[creator_id], back_populates="created_teams")  # NEW: Team creator
    
    # ORIGINAL WORKING RELATIONSHIPS from your 11-month-old model
    matches_as_team1 = relationship("Match", foreign_keys="Match.team1_id", back_populates="team1")
    matches_as_team2 = relationship("Match", foreign_keys="Match.team2_id", back_populates="team2")
    matches_won = relationship("Match", foreign_keys="Match.winner_id", back_populates="winner")  # CRITICAL: This was missing!
    players = relationship("User", secondary="team_player", back_populates="teams")
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="team")
    
    # LOSERS BRACKET RELATIONSHIPS - REMOVED to eliminate conflicts
    # If you need these, we'll need to check your LosersMatch model and fix the back_populates
    # For now, removing them to get login working again
    # losers_matches_as_team1 = relationship("LosersMatch", foreign_keys="LosersMatch.team1_id", back_populates="team1")
    # losers_matches_as_team2 = relationship("LosersMatch", foreign_keys="LosersMatch.team2_id", back_populates="team2")
    
    # TKR relationships - Keep these for your TKR functionality
    tkr_registrations = relationship("TKRTeamRegistration", back_populates="team")