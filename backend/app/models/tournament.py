# app/models/tournament.py
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum
from datetime import datetime

# Association tables
team_members = Table('team_members', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('team_id', Integer, ForeignKey('teams.id'))
)

match_teams = Table('match_teams', Base.metadata,
    Column('match_id', Integer, ForeignKey('matches.id')),
    Column('team_id', Integer, ForeignKey('teams.id'))
)

match_teams = Table('match_teams', Base.metadata,
    Column('match_id', Integer, ForeignKey('matches.id')),
    Column('team_id', Integer, ForeignKey('teams.id')),
    extend_existing=True  # Add this line to allow table redefinition
)

team_player = Table('team_player', Base.metadata,
    Column('team_id', Integer, ForeignKey('teams.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)

class TournamentFormat(enum.Enum):
    SINGLE_ELIMINATION = "single_elimination"
    DOUBLE_ELIMINATION = "double_elimination"
    
class TournamentStatus(enum.Enum):
    PENDING = "pending"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"  # Added CANCELLED status

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    format = Column(Enum('single_elimination', 'double_elimination', name='tournament_format'))
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    creator_id = Column(Integer, ForeignKey("users.id"))
    
    creator = relationship("User", back_populates="created_tournaments")
    teams = relationship("Team", back_populates="tournament", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="tournament", cascade="all, delete-orphan")
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="tournament", cascade="all, delete-orphan")

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    
    tournament = relationship("Tournament", back_populates="teams")
    players = relationship("User", secondary=team_player, back_populates="teams")
    matches = relationship("Match", secondary="match_teams", back_populates="teams")
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="team")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    round = Column(Integer)
    match_number = Column(Integer)
    winner_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    
    tournament = relationship("Tournament", back_populates="matches")
    teams = relationship("Team", secondary="match_teams", back_populates="matches")
    winner = relationship("Team", foreign_keys=[winner_id])

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



# Update User model to include relationship with tournaments
from app.models.user import User

User.created_tournaments = relationship("Tournament", back_populates="creator")
User.teams = relationship("Team", secondary="team_player", back_populates="players")
Tournament.matches = relationship("Match", back_populates="tournament")