# app/models/tkr.py - FIXED VERSION
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Boolean, Text, Float, Enum
from sqlalchemy.orm import relationship
from app.models.base import Base
from datetime import datetime
import enum

# FIX: Change enums to use string values to match Pydantic schemas
class TKRTeamSize(str, enum.Enum):
    SOLO = "SOLO"
    DUOS = "DUOS"
    TRIOS = "TRIOS"
    QUADS = "QUADS"

class PaymentStatus(str, enum.Enum):
    UNPAID = "UNPAID"
    PARTIAL = "PARTIAL"
    PAID_FULL = "PAID_FULL"
    FREE_ENTRY = "FREE_ENTRY"

class SubmissionStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class TKRTournamentConfig(Base):
    __tablename__ = "tkr_tournament_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), unique=True)
    
    # Map and game configuration
    map_name = Column(String, nullable=False)
    team_size = Column(Enum(TKRTeamSize), nullable=False)
    
    # Time configuration
    consecutive_hours = Column(Integer, nullable=False)
    tournament_days = Column(Integer, nullable=False)
    
    # Game requirements
    best_games_count = Column(Integer, nullable=False)
    
    # Scoring configuration
    placement_multipliers = Column(JSON, nullable=False)
    bonus_point_thresholds = Column(JSON, nullable=True)
    max_points_per_map = Column(Integer, nullable=True)
    
    # Prize pool configuration
    host_percentage = Column(Float, default=0.0)
    show_prize_pool = Column(Boolean, default=True)
    
    # Relationships
    tournament = relationship("Tournament", back_populates="tkr_config")
    team_registrations = relationship("TKRTeamRegistration", back_populates="tournament_config")
    templates = relationship("TKRTemplate", back_populates="source_config")

class TKRTeamRegistration(Base):
    __tablename__ = "tkr_team_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False)
    config_id = Column(Integer, ForeignKey("tkr_tournament_configs.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    
    # Team information
    team_name = Column(String, nullable=False)
    team_rank = Column(Integer, nullable=False)
    
    # Player information (JSON array)
    players = Column(JSON, nullable=False)
    
    # Tournament timing
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    
    # Entry and payment information
    is_rerunning = Column(Boolean, default=False)
    using_free_entry = Column(Boolean, default=False)
    free_entry_players = Column(JSON, nullable=True)
    
    # Payment tracking
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.UNPAID)
    payment_amount = Column(Float, default=0.0)
    paid_to = Column(String, nullable=True)
    payment_notes = Column(Text, nullable=True)
    
    # Timestamps
    registered_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tournament = relationship("Tournament")
    tournament_config = relationship("TKRTournamentConfig", back_populates="team_registrations")
    team = relationship("Team")
    game_submissions = relationship("TKRGameSubmission", back_populates="team_registration")

class TKRGameSubmission(Base):
    __tablename__ = "tkr_game_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False)
    team_registration_id = Column(Integer, ForeignKey("tkr_team_registrations.id"), nullable=False)
    
    # Game details
    game_number = Column(Integer, nullable=False)
    kills = Column(Integer, nullable=False)
    placement = Column(Integer, nullable=False)
    
    # Verification
    vod_url = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    
    # Scoring
    base_score = Column(Float, nullable=True)
    bonus_points = Column(Float, default=0.0)
    final_score = Column(Float, nullable=True)
    
    # Status and verification
    status = Column(Enum(SubmissionStatus), default=SubmissionStatus.PENDING)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verification_notes = Column(Text, nullable=True)
    
    # Timestamps
    submitted_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    
    # Relationships
    tournament = relationship("Tournament")
    team_registration = relationship("TKRTeamRegistration", back_populates="game_submissions")
    verified_by_user = relationship("User")

class TKRLeaderboard(Base):
    __tablename__ = "tkr_leaderboards"
    
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=False)
    team_registration_id = Column(Integer, ForeignKey("tkr_team_registrations.id"), nullable=False)
    
    # Calculated totals
    total_kills = Column(Integer, default=0)
    total_score = Column(Float, default=0.0)
    games_submitted = Column(Integer, default=0)
    
    # Ranking
    current_rank = Column(Integer, nullable=True)
    
    # Performance metrics
    average_kills = Column(Float, nullable=True)
    average_placement = Column(Float, nullable=True)
    
    # Timestamps
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tournament = relationship("Tournament")
    team_registration = relationship("TKRTeamRegistration")

class TKRTemplate(Base):
    __tablename__ = "tkr_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Template metadata
    template_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Saved configuration
    map_name = Column(String, nullable=False)
    team_size = Column(Enum(TKRTeamSize), nullable=False)
    consecutive_hours = Column(Integer, nullable=False)
    tournament_days = Column(Integer, nullable=False)
    best_games_count = Column(Integer, nullable=False)
    placement_multipliers = Column(JSON, nullable=False)
    bonus_point_thresholds = Column(JSON, nullable=True)
    max_points_per_map = Column(Integer, nullable=True)
    host_percentage = Column(Float, default=0.0)
    show_prize_pool = Column(Boolean, default=True)
    
    # Source reference
    source_config_id = Column(Integer, ForeignKey("tkr_tournament_configs.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    host = relationship("User")
    source_config = relationship("TKRTournamentConfig", back_populates="templates")