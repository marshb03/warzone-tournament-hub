# app/api/v1/endpoints/tkr.py - Complete updated file with Submit Scores security
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app import crud
from app.api import deps
from app.models.user import User, UserRole
from app.models.tournament import Tournament, TournamentFormat, TournamentStatus
from app.models.team import Team
from app.schemas.tkr import (
    TKRTournamentConfig, TKRTournamentConfigCreate, TKRTournamentConfigUpdate,
    TKRTeamRegistration, TKRTeamRegistrationCreate, TKRTeamRegistrationUpdate,
    TKRGameSubmission, TKRGameSubmissionCreate, TKRGameSubmissionUpdate,
    TKRLeaderboardEntry, TKRTemplate, TKRTemplateCreate, TKRTemplateUpdate,
    TKRPrizePool, TKRTournamentDetails, TKRBulkGameSubmission
)
from app.crud import tkr as tkr_crud
from app.crud import tournament as tournament_crud
from app.crud import team as team_crud

router = APIRouter()

def check_tournament_access(user: User, tournament: Tournament) -> bool:
    """Check if user has access to manage tournament"""
    return (user.role == UserRole.SUPER_ADMIN or 
            (user.role == UserRole.HOST and tournament.creator_id == user.id))

def check_tkr_tournament(tournament: Tournament) -> bool:
    """Check if tournament is TKR format"""
    return tournament.format == TournamentFormat.TKR

def verify_team_ownership(
    db: Session, 
    tournament_id: int, 
    team_registration_id: int, 
    current_user: User
) -> bool:
    """Verify that the current user owns the team for the given registration"""
    from app.models.tkr import TKRTeamRegistration
    registration = db.query(TKRTeamRegistration).join(Team).filter(
        TKRTeamRegistration.id == team_registration_id,
        TKRTeamRegistration.tournament_id == tournament_id,
        Team.creator_id == current_user.id
    ).first()
    
    return bool(registration)

# TKR Tournament Configuration Endpoints
@router.post("/tournaments/{tournament_id}/config", response_model=TKRTournamentConfig)
def create_tkr_tournament_config(
    tournament_id: int,
    config: TKRTournamentConfigCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_host_or_super_admin)
):
    """Create TKR configuration for a tournament"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if not check_tkr_tournament(tournament):
        raise HTTPException(status_code=400, detail="Tournament must be TKR format")
    
    # Check if config already exists
    existing_config = tkr_crud.get_tkr_config(db, tournament_id)
    if existing_config:
        raise HTTPException(status_code=400, detail="TKR configuration already exists")
    
    config.tournament_id = tournament_id
    return tkr_crud.create_tkr_config(db, config)

@router.get("/tournaments/{tournament_id}/config", response_model=TKRTournamentConfig)
def get_tkr_tournament_config(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get TKR configuration for a tournament"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    config = tkr_crud.get_tkr_config(db, tournament_id)
    if not config:
        raise HTTPException(status_code=404, detail="TKR configuration not found")
    
    return config

@router.put("/tournaments/{tournament_id}/config", response_model=TKRTournamentConfig)
def update_tkr_tournament_config(
    tournament_id: int,
    config_update: TKRTournamentConfigUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_host_or_super_admin)
):
    """Update TKR configuration for a tournament"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    config = tkr_crud.update_tkr_config(db, tournament_id, config_update)
    if not config:
        raise HTTPException(status_code=404, detail="TKR configuration not found")
    
    return config

# TKR Team Registration Endpoints
@router.post("/tournaments/{tournament_id}/register", response_model=TKRTeamRegistration)
def register_team_for_tkr(
    tournament_id: int,
    registration: TKRTeamRegistrationCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Register a team for TKR tournament - UPDATED with user ownership tracking"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Allow registration for both PENDING and ONGOING TKR tournaments
    if tournament.status not in [TournamentStatus.PENDING, TournamentStatus.ONGOING]:
        raise HTTPException(status_code=400, detail="Tournament registration is closed")
    
    # Additional check: Ensure tournament hasn't ended
    if tournament.end_date and tournament.end_time:
        current_time = datetime.utcnow()
        tournament_end = datetime.combine(
            tournament.end_date,
            datetime.strptime(tournament.end_time, '%H:%M').time()
        )
        
        if current_time >= tournament_end:
            raise HTTPException(status_code=400, detail="Tournament registration has ended")
    
    config = tkr_crud.get_tkr_config(db, tournament_id)
    if not config:
        raise HTTPException(status_code=404, detail="TKR configuration not found")
    
    # FIXED: Proper enum-to-number mapping for team size validation
    def get_team_size_number(team_size_value):
        """Convert team size enum to number - handles all possible cases"""
        # Convert to string for consistent handling
        size_str = str(team_size_value).upper()
        
        # Handle potential enum prefixes like "TKRTeamSize.QUADS"
        if '.' in size_str:
            size_str = size_str.split('.')[-1]
            
        mapping = {
            "SOLO": 1,
            "DUOS": 2,
            "TRIOS": 3,
            "QUADS": 4
        }
        
        return mapping.get(size_str, 4)  # Default to 4 if unknown
    
    expected_team_size = get_team_size_number(config.team_size)
    actual_team_size = len(registration.players)
    
    if actual_team_size != expected_team_size:
        raise HTTPException(
            status_code=400, 
            detail=f"Team must have exactly {expected_team_size} players (received {actual_team_size})"
        )
    
    # Validate start time is within tournament dates
    tournament_start = tournament.start_date
    tournament_end_date = tournament.end_date or (tournament_start + timedelta(days=config.tournament_days))
    
    if not (tournament_start.date() <= registration.start_time.date() <= tournament_end_date.date()):
        raise HTTPException(
            status_code=400, 
            detail="Start time must be within tournament dates"
        )
    
    # Create team if it doesn't exist - UPDATED to include user tracking
    # Check if team already exists
    existing_team = db.query(Team).filter(
        Team.name == registration.team_name,
        Team.tournament_id == tournament_id
    ).first()
    
    if existing_team:
        # Check if current user owns this team
        if existing_team.creator_id and existing_team.creator_id != current_user.id:
            raise HTTPException(
                status_code=403, 
                detail="A team with this name already exists and belongs to another user"
            )
        team = existing_team
        # Update creator_id if it wasn't set before
        if not existing_team.creator_id:
            existing_team.creator_id = current_user.id
            db.commit()
            db.refresh(existing_team)
    else:
        # Create new team with user ownership
        team = Team(
            name=registration.team_name,
            tournament_id=tournament_id,
            creator_id=current_user.id
        )
        db.add(team)
        db.commit()
        db.refresh(team)
    
    registration.tournament_id = tournament_id
    return tkr_crud.create_tkr_team_registration(db, registration, team.id, config.id)

@router.get("/tournaments/{tournament_id}/registrations", response_model=List[TKRTeamRegistration])
def get_tkr_tournament_registrations(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get all team registrations for a TKR tournament"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    return tkr_crud.get_tkr_team_registrations_by_tournament(db, tournament_id)

# ADD: New endpoint for getting ALL user registrations (plural)
@router.get("/tournaments/{tournament_id}/my-registrations", response_model=List[TKRTeamRegistration])
def get_my_team_registrations(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get ALL of current user's team registrations for a TKR tournament"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Find ALL user registrations by checking team ownership
    from app.models.tkr import TKRTeamRegistration
    from app.models.team import Team
    
    registrations = db.query(TKRTeamRegistration).join(Team).filter(
        TKRTeamRegistration.tournament_id == tournament_id,
        Team.creator_id == current_user.id
    ).order_by(TKRTeamRegistration.registered_at.desc()).all()  # Most recent first
    
    return registrations

# MODIFY: Update existing endpoint to be more explicit about single team
@router.get("/tournaments/{tournament_id}/my-registration", response_model=Optional[TKRTeamRegistration])
def get_my_team_registration(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get current user's FIRST team registration for a TKR tournament (backwards compatibility)"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Find the user's FIRST registration by checking team ownership
    from app.models.tkr import TKRTeamRegistration
    from app.models.team import Team
    
    registration = db.query(TKRTeamRegistration).join(Team).filter(
        TKRTeamRegistration.tournament_id == tournament_id,
        Team.creator_id == current_user.id
    ).order_by(TKRTeamRegistration.registered_at.desc()).first()  # Most recent first for backwards compatibility
    
    return registration

@router.get("/tournaments/{tournament_id}/can-submit-scores")
def can_user_submit_scores(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Check if current user can submit scores for this tournament"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Check if user has a registered team
    from app.models.tkr import TKRTeamRegistration
    registration = db.query(TKRTeamRegistration).join(Team).filter(
        TKRTeamRegistration.tournament_id == tournament_id,
        Team.creator_id == current_user.id
    ).order_by(TKRTeamRegistration.registered_at.desc()).first()
    
    can_submit = bool(registration)
    message = "You can submit scores"
    
    # Additional checks with FIXED grace period calculation
    if registration:
        current_time = datetime.utcnow()
        
        # FIXED: Grace period is 24 hours from END of competition window (not start)
        if registration.end_time:
            # Competition window has ended, check grace period
            grace_period_hours = 24
            submission_deadline = registration.end_time + timedelta(hours=grace_period_hours)
            
            if current_time > submission_deadline:
                can_submit = False
                message = "Submission deadline has passed"
            elif current_time > registration.end_time:
                # In grace period
                hours_left = int((submission_deadline - current_time).total_seconds() / 3600)
                message = f"Grace period - {hours_left}h remaining to submit"
            else:
                # Competition window is still active
                message = "Competition window active - you can submit scores"
        elif not registration.start_time or current_time < registration.start_time:
            message = "Competition window has not started yet"
        else:
            # No end time set yet, but started
            message = "Competition window active"
    else:
        message = "No team registration found for this tournament"
    
    return {
        "can_submit": can_submit,
        "registration": registration,
        "message": message
    }
    
# ADD: New endpoint to check if user can submit for specific team
@router.get("/tournaments/{tournament_id}/can-submit-scores/{team_registration_id}")
def can_user_submit_scores_for_team(
    tournament_id: int,
    team_registration_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Check if current user can submit scores for a specific team registration - FIXED VERSION"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Verify team ownership
    if not verify_team_ownership(db, tournament_id, team_registration_id, current_user):
        raise HTTPException(status_code=403, detail="You don't own this team registration")
    
    # Get the specific registration
    registration = tkr_crud.get_tkr_team_registration(db, team_registration_id)
    if not registration:
        raise HTTPException(status_code=404, detail="Team registration not found")
    
    can_submit = True
    message = "You can submit scores for this team"
    submission_deadline = None
    
    # FIXED: Proper grace period calculation
    current_time = datetime.utcnow()
    
    if registration.end_time:
        # FIXED: Grace period is 24 hours from END of competition window
        # This matches your requirement: start + competition_duration + 24 hours
        grace_period_hours = 24
        submission_deadline = registration.end_time + timedelta(hours=grace_period_hours)
        
        if current_time > submission_deadline:
            can_submit = False
            message = "Submission deadline has passed"
        elif current_time > registration.end_time:
            # Currently in grace period
            hours_remaining = int((submission_deadline - current_time).total_seconds() / 3600)
            minutes_remaining = int(((submission_deadline - current_time).total_seconds() % 3600) / 60)
            
            if hours_remaining > 0:
                message = f"Grace period - {hours_remaining}h {minutes_remaining}m remaining to submit"
            else:
                message = f"Grace period - {minutes_remaining}m remaining to submit"
        else:
            # Competition window is still active
            message = "Competition window active - ready to submit"
    elif not registration.start_time or current_time < registration.start_time:
        can_submit = False
        message = f"Competition starts at {registration.start_time.strftime('%Y-%m-%d %H:%M')} UTC"
    else:
        # Competition has started but no end time calculated yet
        message = "Competition window active - ready to submit"
    
    return {
        "can_submit": can_submit,
        "registration": registration,
        "message": message,
        "submission_deadline": submission_deadline.isoformat() if submission_deadline else None,
        "current_time": current_time.isoformat(),
        "competition_end_time": registration.end_time.isoformat() if registration.end_time else None
    }

@router.put("/registrations/{registration_id}", response_model=TKRTeamRegistration)
def update_tkr_team_registration(
    registration_id: int,
    registration_update: TKRTeamRegistrationUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Update TKR team registration (hosts/admins can update payment info)"""
    registration = tkr_crud.get_tkr_team_registration(db, registration_id)
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    tournament = tournament_crud.get_tournament(db, registration.tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Check permissions for payment updates
    payment_fields = {'payment_status', 'payment_amount', 'paid_to', 'payment_notes'}
    updating_payment = any(field in registration_update.dict(exclude_unset=True) for field in payment_fields)
    
    if updating_payment and not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Only hosts and admins can update payment information")
    
    return tkr_crud.update_tkr_team_registration(db, registration_id, registration_update)

# TKR Game Submission Endpoints - UPDATED with security checks
@router.post("/tournaments/{tournament_id}/submissions", response_model=TKRGameSubmission)
def submit_tkr_game(
    tournament_id: int,
    submission: TKRGameSubmissionCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Submit a single game for TKR tournament - UPDATED with FIXED grace period check"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Validate team registration exists and belongs to current user
    registration = tkr_crud.get_tkr_team_registration(db, submission.team_registration_id)
    if not registration:
        raise HTTPException(status_code=404, detail="Team registration not found")
    
    if registration.tournament_id != tournament_id:
        raise HTTPException(status_code=400, detail="Registration does not match tournament")
    
    # SECURITY CHECK: Verify team ownership
    if not verify_team_ownership(db, tournament_id, submission.team_registration_id, current_user):
        raise HTTPException(
            status_code=403, 
            detail="You can only submit scores for your own team"
        )
    
    # FIXED: Check submission deadline with correct grace period calculation
    current_time = datetime.utcnow()
    
    if registration.end_time:
        # FIXED: 24 hours from END of competition window (not start)
        grace_period_hours = 24
        submission_deadline = registration.end_time + timedelta(hours=grace_period_hours)
        
        if current_time > submission_deadline:
            raise HTTPException(
                status_code=400, 
                detail=f"Submission deadline has passed. Deadline was {submission_deadline.strftime('%Y-%m-%d %H:%M')} UTC"
            )
    elif registration.start_time and current_time < registration.start_time:
        raise HTTPException(
            status_code=400,
            detail=f"Competition has not started yet. Starts at {registration.start_time.strftime('%Y-%m-%d %H:%M')} UTC"
        )
    
    submission.tournament_id = tournament_id
    return tkr_crud.create_tkr_game_submission(db, submission)

@router.post("/tournaments/{tournament_id}/bulk-submissions", response_model=List[TKRGameSubmission])
def submit_tkr_games_bulk(
    tournament_id: int,
    bulk_submission: TKRBulkGameSubmission,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Submit multiple games at once for TKR tournament - UPDATED with FIXED grace period check"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Validate team registration
    registration = tkr_crud.get_tkr_team_registration(db, bulk_submission.team_registration_id)
    if not registration:
        raise HTTPException(status_code=404, detail="Team registration not found")
    
    if registration.tournament_id != tournament_id:
        raise HTTPException(status_code=400, detail="Registration does not match tournament")
    
    # SECURITY CHECK: Verify team ownership
    if not verify_team_ownership(db, tournament_id, bulk_submission.team_registration_id, current_user):
        raise HTTPException(
            status_code=403, 
            detail="You can only submit scores for your own team"
        )
    
    # FIXED: Check submission deadline with correct grace period calculation
    current_time = datetime.utcnow()
    
    if registration.end_time:
        # FIXED: 24 hours from END of competition window
        grace_period_hours = 24
        submission_deadline = registration.end_time + timedelta(hours=grace_period_hours)
        
        if current_time > submission_deadline:
            raise HTTPException(
                status_code=400, 
                detail=f"Submission deadline has passed. Deadline was {submission_deadline.strftime('%Y-%m-%d %H:%M')} UTC"
            )
    elif registration.start_time and current_time < registration.start_time:
        raise HTTPException(
            status_code=400,
            detail=f"Competition has not started yet. Starts at {registration.start_time.strftime('%Y-%m-%d %H:%M')} UTC"
        )
    
    # Submit all games
    submitted_games = []
    for game_data in bulk_submission.games:
        submission = TKRGameSubmissionCreate(
            **game_data.dict(),
            tournament_id=tournament_id,
            team_registration_id=bulk_submission.team_registration_id
        )
        submitted_game = tkr_crud.create_tkr_game_submission(db, submission)
        submitted_games.append(submitted_game)
    
    return submitted_games

@router.get("/tournaments/{tournament_id}/submissions", response_model=List[TKRGameSubmission])
def get_tkr_tournament_submissions(
    tournament_id: int,
    team_registration_id: Optional[int] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get game submissions for a TKR tournament"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if team_registration_id:
        # If requesting specific team's submissions, verify ownership for non-admins
        if not check_tournament_access(current_user, tournament):
            if not verify_team_ownership(db, tournament_id, team_registration_id, current_user):
                raise HTTPException(
                    status_code=403, 
                    detail="You can only view your own team's submissions"
                )
        return tkr_crud.get_tkr_game_submissions_by_team(db, team_registration_id)
    else:
        return tkr_crud.get_tkr_game_submissions_by_tournament(db, tournament_id)

@router.put("/submissions/{submission_id}", response_model=TKRGameSubmission)
def update_tkr_game_submission(
    submission_id: int,
    submission_update: TKRGameSubmissionUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Update TKR game submission (hosts/admins only)"""
    submission = tkr_crud.get_tkr_game_submission(db, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    tournament = tournament_crud.get_tournament(db, submission.tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return tkr_crud.update_tkr_game_submission(db, submission_id, submission_update)

# TKR Leaderboard and Tournament Details
@router.get("/tournaments/{tournament_id}/leaderboard", response_model=List[TKRLeaderboardEntry])
def get_tkr_leaderboard(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get TKR tournament leaderboard"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    leaderboard = tkr_crud.get_tkr_leaderboard(db, tournament_id)
    
    # Convert to response format
    from app.schemas.tkr import TKRLeaderboardEntry
    leaderboard_entries = []
    for entry in leaderboard:
        leaderboard_entries.append(TKRLeaderboardEntry(
            id=entry.id,
            tournament_id=entry.tournament_id,
            team_registration_id=entry.team_registration_id,
            team_name=entry.team_registration.team_name,
            total_kills=entry.total_kills,
            total_score=entry.total_score,
            games_submitted=entry.games_submitted,
            current_rank=entry.current_rank,
            average_kills=entry.average_kills,
            average_placement=entry.average_placement,
            last_updated=entry.last_updated,
            team_registration=entry.team_registration
        ))
    
    return leaderboard_entries

@router.get("/tournaments/{tournament_id}/details", response_model=TKRTournamentDetails)
def get_tkr_tournament_details(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get complete TKR tournament details including config, stats, and leaderboard"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    config = tkr_crud.get_tkr_config(db, tournament_id)
    if not config:
        raise HTTPException(status_code=404, detail="TKR configuration not found")
    
    registrations = tkr_crud.get_tkr_team_registrations_by_tournament(db, tournament_id)
    leaderboard = tkr_crud.get_tkr_leaderboard(db, tournament_id)
    
    # Calculate statistics
    total_registrations = len(registrations)
    current_time = datetime.utcnow()
    active_teams = sum(1 for reg in registrations 
                      if reg.start_time <= current_time <= (reg.end_time or current_time))
    completed_teams = sum(1 for reg in registrations 
                         if reg.end_time and current_time > reg.end_time)
    
    # Get prize pool if visible
    prize_pool = None
    if config.show_prize_pool:
        prize_pool_data = tkr_crud.calculate_tkr_prize_pool(db, tournament_id)
        prize_pool = TKRPrizePool(**prize_pool_data)
    
    # Convert leaderboard
    leaderboard_entries = []
    for entry in leaderboard:
        leaderboard_entries.append(TKRLeaderboardEntry(
            id=entry.id,
            tournament_id=entry.tournament_id,
            team_registration_id=entry.team_registration_id,
            team_name=entry.team_registration.team_name,
            total_kills=entry.total_kills,
            total_score=entry.total_score,
            games_submitted=entry.games_submitted,
            current_rank=entry.current_rank,
            average_kills=entry.average_kills,
            average_placement=entry.average_placement,
            last_updated=entry.last_updated,
            team_registration=entry.team_registration
        ))
    
    return TKRTournamentDetails(
        tournament_id=tournament_id,
        config=config,
        total_registrations=total_registrations,
        active_teams=active_teams,
        completed_teams=completed_teams,
        prize_pool=prize_pool,
        leaderboard=leaderboard_entries
    )

@router.post("/tournaments/{tournament_id}/leaderboard/refresh")
def refresh_tkr_leaderboard(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_host_or_super_admin)
):
    """Manually refresh TKR tournament leaderboard"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    tkr_crud.update_tournament_leaderboard_ranks(db, tournament_id)
    return {"message": "Leaderboard refreshed successfully"}

# TKR Prize Pool Endpoint
@router.get("/tournaments/{tournament_id}/prize-pool", response_model=TKRPrizePool)
def get_tkr_prize_pool(
    tournament_id: int,
    db: Session = Depends(deps.get_db)
):
    """Get TKR tournament prize pool information"""
    tournament = tournament_crud.get_tournament(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    config = tkr_crud.get_tkr_config(db, tournament_id)
    if not config:
        raise HTTPException(status_code=404, detail="TKR configuration not found")
    
    if not config.show_prize_pool:
        raise HTTPException(status_code=403, detail="Prize pool is not visible for this tournament")
    
    prize_pool_data = tkr_crud.calculate_tkr_prize_pool(db, tournament_id)
    return TKRPrizePool(**prize_pool_data)

# TKR Template Endpoints
@router.post("/templates", response_model=TKRTemplate)
def create_tkr_template(
    template: TKRTemplateCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_host_or_super_admin)
):
    """Create TKR configuration template"""
    return tkr_crud.create_tkr_template(db, template, current_user.id)

@router.get("/templates", response_model=List[TKRTemplate])
def get_my_tkr_templates(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_host_or_super_admin)
):
    """Get user's TKR configuration templates"""
    return tkr_crud.get_tkr_templates_by_host(db, current_user.id)

@router.get("/templates/{template_id}", response_model=TKRTemplate)
def get_tkr_template(
    template_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_host_or_super_admin)
):
    """Get specific TKR template"""
    template = tkr_crud.get_tkr_template(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Only allow access to own templates unless super admin
    if current_user.role != UserRole.SUPER_ADMIN and template.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return template

@router.put("/templates/{template_id}", response_model=TKRTemplate)
def update_tkr_template(
    template_id: int,
    template_update: TKRTemplateUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_host_or_super_admin)
):
    """Update TKR template"""
    template = tkr_crud.get_tkr_template(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Only allow updating own templates unless super admin
    if current_user.role != UserRole.SUPER_ADMIN and template.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return tkr_crud.update_tkr_template(db, template_id, template_update)

@router.delete("/templates/{template_id}")
def delete_tkr_template(
    template_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_host_or_super_admin)
):
    """Delete TKR template"""
    template = tkr_crud.get_tkr_template(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Only allow deleting own templates unless super admin
    if current_user.role != UserRole.SUPER_ADMIN and template.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    success = tkr_crud.delete_tkr_template(db, template_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete template")
    
    return {"message": "Template deleted successfully"}
