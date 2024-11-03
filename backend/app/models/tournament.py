# app/models/tournament.py
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum
from datetime import datetime

class TournamentFormat(enum.Enum):
    SINGLE_ELIMINATION = "SINGLE_ELIMINATION"
    DOUBLE_ELIMINATION = "DOUBLE_ELIMINATION"
 
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
    end_date = Column(DateTime)
    creator_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(TournamentStatus), default=TournamentStatus.PENDING)
 
    creator = relationship("User", back_populates="created_tournaments")
    teams = relationship("Team", back_populates="tournament", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="tournament", cascade="all, delete-orphan")
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="tournament", cascade="all, delete-orphan")
    losers_matches = relationship("LosersMatch", back_populates="tournament", cascade="all, delete-orphan")