# app/schemas/tkr.py - Fixed for proper enum serialization
from pydantic import BaseModel, field_validator, Field, ConfigDict
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum

class TKRTeamSize(str, Enum):
    SOLO = "SOLO"
    DUOS = "DUOS"
    TRIOS = "TRIOS"
    QUADS = "QUADS"

class PaymentStatus(str, Enum):
    UNPAID = "UNPAID"
    PARTIAL = "PARTIAL"
    PAID_FULL = "PAID_FULL"
    FREE_ENTRY = "FREE_ENTRY"

class SubmissionStatus(str, Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

# Player information for team registration
class TKRPlayer(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    rank: int = Field(..., ge=1, le=9999)
    stream: str = Field(..., pattern=r'^https?://.+')

    @field_validator('stream')
    @classmethod
    def validate_stream_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError('Stream must be a valid URL starting with http:// or https://')
        return v

# TKR Tournament Configuration
class TKRTournamentConfigBase(BaseModel):
    map_name: str = Field(..., min_length=1, max_length=100)
    team_size: TKRTeamSize
    consecutive_hours: int = Field(..., ge=1, le=24)
    tournament_days: int = Field(..., ge=1, le=30)
    best_games_count: int = Field(..., ge=1, le=20)
    placement_multipliers: Dict[str, float]
    bonus_point_thresholds: Optional[Dict[str, int]] = None
    max_points_per_map: Optional[int] = Field(None, ge=1, le=1000)
    host_percentage: float = Field(0.0, ge=0.0, le=1.0)
    show_prize_pool: bool = True

    @field_validator('placement_multipliers')
    @classmethod
    def validate_placement_multipliers(cls, v):
        if not v or not isinstance(v, dict):
            raise ValueError('Placement multipliers must be provided as a dictionary')
        
        for key, value in v.items():
            try:
                int(key)
            except ValueError:
                raise ValueError(f'Placement key "{key}" must be numeric')
            
            if not isinstance(value, (int, float)) or value <= 0:
                raise ValueError(f'Placement multiplier for {key} must be a positive number')
        
        return v

    @field_validator('bonus_point_thresholds')
    @classmethod
    def validate_bonus_thresholds(cls, v):
        if v is not None:
            for key, value in v.items():
                try:
                    int(key)
                except ValueError:
                    raise ValueError(f'Bonus threshold key "{key}" must be numeric')
                
                if not isinstance(value, int) or value < 0:
                    raise ValueError(f'Bonus points for {key} kills must be a non-negative integer')
        return v

class TKRTournamentConfigCreate(TKRTournamentConfigBase):
    tournament_id: int

class TKRTournamentConfigUpdate(BaseModel):
    map_name: Optional[str] = None
    team_size: Optional[TKRTeamSize] = None
    consecutive_hours: Optional[int] = None
    tournament_days: Optional[int] = None
    best_games_count: Optional[int] = None
    placement_multipliers: Optional[Dict[str, float]] = None
    bonus_point_thresholds: Optional[Dict[str, int]] = None
    max_points_per_map: Optional[int] = None
    host_percentage: Optional[float] = None
    show_prize_pool: Optional[bool] = None

class TKRTournamentConfig(TKRTournamentConfigBase):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)  # KEY FIX: use_enum_values=True
    
    id: int
    tournament_id: int

# TKR Team Registration
class TKRTeamRegistrationBase(BaseModel):
    team_name: str = Field(..., min_length=1, max_length=100)
    team_rank: int = Field(..., ge=1, le=99999)
    players: List[TKRPlayer]
    start_time: datetime
    is_rerunning: bool = False
    using_free_entry: bool = False
    free_entry_players: Optional[List[str]] = None

    @field_validator('players')
    @classmethod
    def validate_players(cls, v, info):
        if not v:
            raise ValueError('At least one player must be provided')
        return v

    @field_validator('team_rank')
    @classmethod
    def validate_team_rank(cls, v, info):
        players = info.data.get('players', [])
        if players:
            calculated_rank = sum(player.rank for player in players)
            if v != calculated_rank:
                raise ValueError(f'Team rank ({v}) must equal sum of player ranks ({calculated_rank})')
        return v

    @field_validator('free_entry_players')
    @classmethod
    def validate_free_entry_players(cls, v, info):
        using_free_entry = info.data.get('using_free_entry', False)
        players = info.data.get('players', [])
        
        if using_free_entry and not v:
            raise ValueError('Must specify which players are using free entry')
        
        if v:
            player_names = [player.name for player in players]
            for free_player in v:
                if free_player not in player_names:
                    raise ValueError(f'Free entry player "{free_player}" not found in team roster')
        
        return v

class UserInTeam(BaseModel):
    id: int
    username: str
    email: str
    
    class Config:
        from_attributes = True

class TeamInRegistration(BaseModel):
    id: int
    name: str
    creator: Optional[UserInTeam] = None
    
    class Config:
        from_attributes = True

class TKRTeamRegistrationCreate(TKRTeamRegistrationBase):
    tournament_id: int

class TKRTeamRegistrationUpdate(BaseModel):
    team_name: Optional[str] = None
    players: Optional[List[TKRPlayer]] = None
    start_time: Optional[datetime] = None
    payment_status: Optional[PaymentStatus] = None
    payment_amount: Optional[float] = None
    paid_to: Optional[str] = None
    payment_notes: Optional[str] = None

class TKRTeamRegistration(TKRTeamRegistrationBase):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)  # KEY FIX: use_enum_values=True
    
    id: int
    tournament_id: int
    config_id: int
    team_id: int
    end_time: Optional[datetime] = None
    payment_status: PaymentStatus
    payment_amount: float
    paid_to: Optional[str] = None
    payment_notes: Optional[str] = None
    registered_at: datetime
    updated_at: datetime
    team: Optional[TeamInRegistration] = None

# TKR Game Submission
class TKRGameSubmissionBase(BaseModel):
    game_number: int = Field(..., ge=1, le=50)
    kills: int = Field(..., ge=0, le=200)
    placement: int = Field(..., ge=1, le=150)
    vod_url: str = Field(..., pattern=r'^https?://.+')
    timestamp: str = Field(..., min_length=1, max_length=50)

    @field_validator('vod_url')
    @classmethod
    def validate_vod_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError('VOD URL must be a valid URL starting with http:// or https://')
        return v

class TKRGameSubmissionCreate(TKRGameSubmissionBase):
    tournament_id: int
    team_registration_id: int

class TKRGameSubmissionUpdate(BaseModel):
    kills: Optional[int] = None
    placement: Optional[int] = None
    vod_url: Optional[str] = None
    timestamp: Optional[str] = None
    status: Optional[SubmissionStatus] = None
    verification_notes: Optional[str] = None

class TKRGameSubmission(TKRGameSubmissionBase):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)  # KEY FIX: use_enum_values=True
    
    id: int
    tournament_id: int
    team_registration_id: int
    base_score: Optional[float] = None
    bonus_points: float
    final_score: Optional[float] = None
    status: SubmissionStatus
    verified_by: Optional[int] = None
    verification_notes: Optional[str] = None
    submitted_at: datetime
    verified_at: Optional[datetime] = None

# TKR Leaderboard Entry
class TKRLeaderboardEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)  # KEY FIX: use_enum_values=True
    
    id: int
    tournament_id: int
    team_registration_id: int
    team_name: str
    total_kills: int
    total_score: float
    games_submitted: int
    current_rank: Optional[int] = None
    average_kills: Optional[float] = None
    average_placement: Optional[float] = None
    last_updated: datetime
    team_registration: Optional[TKRTeamRegistration] = None

# TKR Template
class TKRTemplateBase(BaseModel):
    template_name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    map_name: str
    team_size: TKRTeamSize
    consecutive_hours: int
    tournament_days: int
    best_games_count: int
    placement_multipliers: Dict[str, float]
    bonus_point_thresholds: Optional[Dict[str, int]] = None
    max_points_per_map: Optional[int] = None
    host_percentage: float = 0.0
    show_prize_pool: bool = True

class TKRTemplateCreate(TKRTemplateBase):
    pass

class TKRTemplateUpdate(BaseModel):
    template_name: Optional[str] = None
    description: Optional[str] = None
    map_name: Optional[str] = None
    team_size: Optional[TKRTeamSize] = None
    consecutive_hours: Optional[int] = None
    tournament_days: Optional[int] = None
    best_games_count: Optional[int] = None
    placement_multipliers: Optional[Dict[str, float]] = None
    bonus_point_thresholds: Optional[Dict[str, int]] = None
    max_points_per_map: Optional[int] = None
    host_percentage: Optional[float] = None
    show_prize_pool: Optional[bool] = None

class TKRTemplate(TKRTemplateBase):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)  # KEY FIX: use_enum_values=True
    
    id: int
    host_id: int
    source_config_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

# Prize Pool Calculation Response
class TKRPrizePool(BaseModel):
    tournament_id: int
    total_entries: int
    base_entry_fee: float
    total_collected: float
    host_cut: float
    final_prize_pool: float
    show_prize_pool: bool

# TKR Tournament Full Details
class TKRTournamentDetails(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)  # KEY FIX: use_enum_values=True
    
    tournament_id: int
    config: TKRTournamentConfig
    total_registrations: int
    active_teams: int
    completed_teams: int
    prize_pool: Optional[TKRPrizePool] = None
    leaderboard: List[TKRLeaderboardEntry] = []

# Bulk submission for teams
class TKRBulkGameSubmission(BaseModel):
    tournament_id: int
    team_registration_id: int
    games: List[TKRGameSubmissionBase]

    @field_validator('games')
    @classmethod
    def validate_games(cls, v):
        if not v:
            raise ValueError('At least one game must be submitted')
        
        game_numbers = [game.game_number for game in v]
        if len(game_numbers) != len(set(game_numbers)):
            raise ValueError('Duplicate game numbers are not allowed')
        
        return v

# Enhanced response models
class TKRTeamRegistrationResponse(TKRTeamRegistration):
    calculated_entry_fee: Optional[float] = None
    time_window_status: Optional[str] = None

class TKRGameSubmissionWithTeam(TKRGameSubmission):
    team_name: Optional[str] = None
    team_rank: Optional[int] = None

class TKRLeaderboardResponse(BaseModel):
    tournament_id: int
    entries: List[TKRLeaderboardEntry]
    total_teams: int
    active_teams: int
    completed_teams: int
    last_updated: datetime

class TKRHostDashboard(BaseModel):
    tournament_id: int
    config: TKRTournamentConfig
    registrations: List[TKRTeamRegistrationResponse]
    recent_submissions: List[TKRGameSubmissionWithTeam]
    prize_pool: Optional[TKRPrizePool] = None
    quick_stats: Dict[str, Any]

# Validation models
class TKRValidationError(BaseModel):
    field: str
    message: str

class TKRValidationResponse(BaseModel):
    valid: bool
    errors: List[TKRValidationError] = []

# Statistics models
class TKRTeamStats(BaseModel):
    team_registration_id: int
    team_name: str
    total_kills: int
    total_score: float
    games_submitted: int
    average_kills_per_game: float
    average_placement: float
    best_game_kills: int
    best_game_score: float
    consistency_rating: float

class TKRTournamentStats(BaseModel):
    tournament_id: int
    total_teams: int
    total_games_submitted: int
    average_team_score: float
    highest_individual_game_score: float
    most_kills_single_game: int
    completion_rate: float