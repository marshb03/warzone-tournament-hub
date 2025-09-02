# app/models/tournament.py
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum
from datetime import datetime

class TournamentFormat(enum.Enum):
    SINGLE_ELIMINATION = "SINGLE_ELIMINATION"
    DOUBLE_ELIMINATION = "DOUBLE_ELIMINATION"
    TKR = "TKR"
 
class TournamentStatus(enum.Enum):
    PENDING = "PENDING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    format = Column(Enum(TournamentFormat))
    start_date = Column(DateTime, default=datetime.utcnow)
    start_time = Column(String, nullable=True)
    end_date = Column(DateTime, nullable=True)
    end_time = Column(String, nullable=True)  # Add end_time field
    team_size = Column(Integer, nullable=True)
    max_teams = Column(Integer, nullable=True)
    current_teams = Column(Integer, default=0)
    creator_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(TournamentStatus), default=TournamentStatus.PENDING)
    description = Column(String, nullable=True)
    rules = Column(String, nullable=True)
    
    # New enhancement fields
    entry_fee = Column(String, nullable=True)  # "Free" or "$XX.XX" format
    game = Column(String, nullable=True)
    game_mode = Column(String, nullable=True)
    
    # Existing field for bracket configuration
    bracket_config = Column(JSON, nullable=True)
 
    # Relationships
    creator = relationship("User", back_populates="created_tournaments")
    teams = relationship("Team", back_populates="tournament", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="tournament", cascade="all, delete-orphan")
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="tournament", cascade="all, delete-orphan")
    losers_matches = relationship("LosersMatch", back_populates="tournament", cascade="all, delete-orphan")