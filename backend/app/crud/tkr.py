# app/crud/tkr.py - Complete updated version with tournament days calculation
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict
from datetime import datetime, timedelta

from app.models.tkr import (
    TKRTournamentConfig, TKRTeamRegistration, TKRGameSubmission,
    TKRLeaderboard, TKRTemplate, PaymentStatus, SubmissionStatus,
    TKRTeamSize
)
from app.models.tournament import Tournament
from app.models.team import Team
from app.schemas.tkr import (
    TKRTournamentConfigCreate, TKRTournamentConfigUpdate,
    TKRTeamRegistrationCreate, TKRTeamRegistrationUpdate,
    TKRGameSubmissionCreate, TKRGameSubmissionUpdate,
    TKRTemplateCreate, TKRTemplateUpdate
)

class TKRScoringEngine:
    """TKR scoring calculation engine"""
    
    @staticmethod
    def calculate_game_score(
        kills: int,
        placement: int,
        team_rank: int,
        placement_multipliers: Dict[str, float],
        bonus_point_thresholds: Optional[Dict[str, int]] = None,
        max_points_per_map: Optional[int] = None
    ) -> Dict[str, float]:
        """
        Calculate score for a single game submission.
        Formula: ((kills × placement_multiplier) / (10% of team_rank)) + bonus_points = Total Score
        """
        
        # Get placement multiplier
        placement_multiplier = placement_multipliers.get(str(placement), 0.5)  # Default for 11th+
        
        # Calculate base score: ((kills × placement_multiplier) / (10% of team_rank))
        ten_percent_rank = max(team_rank * 0.1, 1)  # Prevent division by zero
        base_score = (kills * placement_multiplier) / ten_percent_rank
        
        # Calculate bonus points
        bonus_points = 0.0
        if bonus_point_thresholds:
            for kill_threshold, bonus in bonus_point_thresholds.items():
                if kills >= int(kill_threshold):
                    bonus_points = max(bonus_points, bonus)  # Take highest applicable bonus
        
        # Calculate total score before cap
        total_score = base_score + bonus_points
        
        # Apply point cap if specified
        if max_points_per_map and total_score > max_points_per_map:
            total_score = float(max_points_per_map)
        
        return {
            "base_score": base_score,
            "bonus_points": bonus_points,
            "final_score": total_score
        }

# TKR Tournament Configuration CRUD
def create_tkr_config(db: Session, config: TKRTournamentConfigCreate) -> TKRTournamentConfig:
    # Get tournament to calculate actual tournament days
    tournament = db.query(Tournament).filter(Tournament.id == config.tournament_id).first()
    
    config_data = config.dict()
    
    if tournament:
        # Calculate actual tournament days from start_date to end_date
        start_date = tournament.start_date.date() if hasattr(tournament.start_date, 'date') else tournament.start_date
        end_date = tournament.end_date.date() if hasattr(tournament.end_date, 'date') else tournament.end_date
        
        if start_date and end_date:
            # Calculate the difference in days
            tournament_days = (end_date - start_date).days + 1  # +1 to include both start and end days
            config_data['tournament_days'] = tournament_days
        # If no end_date or start_date, use provided value
    
    db_config = TKRTournamentConfig(**config_data)
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

def get_tkr_config(db: Session, tournament_id: int) -> Optional[TKRTournamentConfig]:
    return db.query(TKRTournamentConfig).filter(
        TKRTournamentConfig.tournament_id == tournament_id
    ).first()

def update_tkr_config(
    db: Session, tournament_id: int, config_update: TKRTournamentConfigUpdate
) -> Optional[TKRTournamentConfig]:
    db_config = get_tkr_config(db, tournament_id)
    if not db_config:
        return None
    
    update_data = config_update.dict(exclude_unset=True)
    
    # If tournament_days is not provided, recalculate from tournament dates
    if 'tournament_days' not in update_data:
        tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
        if tournament and tournament.start_date and tournament.end_date:
            start_date = tournament.start_date.date() if hasattr(tournament.start_date, 'date') else tournament.start_date
            end_date = tournament.end_date.date() if hasattr(tournament.end_date, 'date') else tournament.end_date
            tournament_days = (end_date - start_date).days + 1
            update_data['tournament_days'] = tournament_days
    
    # Check if scoring-related fields are being updated
    scoring_fields_changed = any(field in update_data for field in [
        'placement_multipliers', 'bonus_point_thresholds', 'max_points_per_map'
    ])
    
    # Update the configuration
    for field, value in update_data.items():
        setattr(db_config, field, value)
    
    db.commit()
    db.refresh(db_config)
    
    # If scoring fields changed, recalculate all existing game scores
    if scoring_fields_changed:
        recalculate_tournament_scores(db, tournament_id)
    
    return db_config

def recalculate_tournament_scores(db: Session, tournament_id: int) -> bool:
    """Recalculate all game scores for a tournament after config changes"""
    try:
        # Get the updated configuration
        config = get_tkr_config(db, tournament_id)
        if not config:
            return False
        
        # Get all game submissions for this tournament
        submissions = db.query(TKRGameSubmission).filter(
            TKRGameSubmission.tournament_id == tournament_id
        ).all()
        
        # Get all team registrations (needed for team ranks)
        registrations = db.query(TKRTeamRegistration).filter(
            TKRTeamRegistration.tournament_id == tournament_id
        ).all()
        
        # Create a lookup for team ranks
        team_ranks = {reg.id: reg.team_rank for reg in registrations}
        
        # Recalculate each submission
        for submission in submissions:
            team_rank = team_ranks.get(submission.team_registration_id)
            if not team_rank:
                continue  # Skip if we can't find team rank
            
            # Recalculate scores using current configuration
            score_data = TKRScoringEngine.calculate_game_score(
                kills=submission.kills,
                placement=submission.placement,
                team_rank=team_rank,
                placement_multipliers=config.placement_multipliers,
                bonus_point_thresholds=config.bonus_point_thresholds,
                max_points_per_map=config.max_points_per_map
            )
            
            # Update the submission with new scores
            submission.base_score = score_data["base_score"]
            submission.bonus_points = score_data["bonus_points"]
            submission.final_score = score_data["final_score"]
        
        db.commit()
        
        # Update leaderboards for all affected teams
        affected_teams = set(submission.team_registration_id for submission in submissions)
        for team_registration_id in affected_teams:
            update_leaderboard_for_team(db, team_registration_id)
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"Error recalculating tournament scores: {str(e)}")
        return False

def delete_tkr_config(db: Session, tournament_id: int) -> bool:
    db_config = get_tkr_config(db, tournament_id)
    if db_config:
        db.delete(db_config)
        db.commit()
        return True
    return False

# TKR Team Registration CRUD
def create_tkr_team_registration(
    db: Session, registration: TKRTeamRegistrationCreate, team_id: int, config_id: int
) -> TKRTeamRegistration:
    # Calculate end time based on start time + consecutive hours
    config = db.query(TKRTournamentConfig).filter(TKRTournamentConfig.id == config_id).first()
    end_time = registration.start_time + timedelta(hours=config.consecutive_hours)
    
    db_registration = TKRTeamRegistration(
        **registration.dict(),
        team_id=team_id,
        config_id=config_id,
        end_time=end_time
    )
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    
    # Create initial leaderboard entry
    create_initial_leaderboard_entry(db, db_registration.id, registration.tournament_id)
    
    return db_registration

def get_tkr_team_registration(db: Session, registration_id: int) -> Optional[TKRTeamRegistration]:
    """Get single TKR team registration with team creator information"""
    return db.query(TKRTeamRegistration).options(
        joinedload(TKRTeamRegistration.tournament_config),
        joinedload(TKRTeamRegistration.team).joinedload(Team.creator)  # ADD: Load team creator
    ).filter(TKRTeamRegistration.id == registration_id).first()

def get_tkr_team_registrations_by_tournament(
    db: Session, tournament_id: int
) -> List[TKRTeamRegistration]:
    return db.query(TKRTeamRegistration).options(
        joinedload(TKRTeamRegistration.tournament_config),
        joinedload(TKRTeamRegistration.team).joinedload(Team.creator)  # ADD: .joinedload(Team.creator)
    ).filter(TKRTeamRegistration.tournament_id == tournament_id).all()

def update_tkr_team_registration(
    db: Session, registration_id: int, registration_update: TKRTeamRegistrationUpdate
) -> Optional[TKRTeamRegistration]:
    db_registration = get_tkr_team_registration(db, registration_id)
    if not db_registration:
        return None
    
    update_data = registration_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_registration, field, value)
    
    db_registration.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_registration)
    return db_registration

# TKR Game Submission CRUD
def create_tkr_game_submission(
    db: Session, submission: TKRGameSubmissionCreate
) -> TKRGameSubmission:
    # Get team registration to access team rank and tournament config
    team_reg = db.query(TKRTeamRegistration).options(
        joinedload(TKRTeamRegistration.tournament_config)
    ).filter(TKRTeamRegistration.id == submission.team_registration_id).first()
    
    if not team_reg:
        raise ValueError("Team registration not found")
    
    config = team_reg.tournament_config
    
    # Calculate scores
    score_data = TKRScoringEngine.calculate_game_score(
        kills=submission.kills,
        placement=submission.placement,
        team_rank=team_reg.team_rank,
        placement_multipliers=config.placement_multipliers,
        bonus_point_thresholds=config.bonus_point_thresholds,
        max_points_per_map=config.max_points_per_map
    )
    
    db_submission = TKRGameSubmission(
        **submission.dict(),
        base_score=score_data["base_score"],
        bonus_points=score_data["bonus_points"],
        final_score=score_data["final_score"]
    )
    
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    # Update leaderboard
    update_leaderboard_for_team(db, submission.team_registration_id)
    
    return db_submission

def get_tkr_game_submissions_by_team(
    db: Session, team_registration_id: int
) -> List[TKRGameSubmission]:
    return db.query(TKRGameSubmission).filter(
        TKRGameSubmission.team_registration_id == team_registration_id
    ).order_by(TKRGameSubmission.game_number).all()

def get_tkr_game_submissions_by_tournament(
    db: Session, tournament_id: int
) -> List[TKRGameSubmission]:
    return db.query(TKRGameSubmission).filter(
        TKRGameSubmission.tournament_id == tournament_id
    ).order_by(TKRGameSubmission.submitted_at.desc()).all()

def update_tkr_game_submission(
    db: Session, submission_id: int, submission_update: TKRGameSubmissionUpdate
) -> Optional[TKRGameSubmission]:
    db_submission = db.query(TKRGameSubmission).filter(
        TKRGameSubmission.id == submission_id
    ).first()
    
    if not db_submission:
        return None
    
    update_data = submission_update.dict(exclude_unset=True)
    
    # If kills or placement are being updated, recalculate scores
    if 'kills' in update_data or 'placement' in update_data:
        team_reg = db.query(TKRTeamRegistration).options(
            joinedload(TKRTeamRegistration.tournament_config)
        ).filter(TKRTeamRegistration.id == db_submission.team_registration_id).first()
        
        config = team_reg.tournament_config
        
        kills = update_data.get('kills', db_submission.kills)
        placement = update_data.get('placement', db_submission.placement)
        
        score_data = TKRScoringEngine.calculate_game_score(
            kills=kills,
            placement=placement,
            team_rank=team_reg.team_rank,
            placement_multipliers=config.placement_multipliers,
            bonus_point_thresholds=config.bonus_point_thresholds,
            max_points_per_map=config.max_points_per_map
        )
        
        update_data.update({
            "base_score": score_data["base_score"],
            "bonus_points": score_data["bonus_points"],
            "final_score": score_data["final_score"]
        })
    
    for field, value in update_data.items():
        setattr(db_submission, field, value)
    
    db.commit()
    db.refresh(db_submission)
    
    # Update leaderboard
    update_leaderboard_for_team(db, db_submission.team_registration_id)
    
    return db_submission

def delete_tkr_game_submission(db: Session, submission_id: int) -> bool:
    db_submission = db.query(TKRGameSubmission).filter(
        TKRGameSubmission.id == submission_id
    ).first()
    
    if db_submission:
        team_registration_id = db_submission.team_registration_id
        db.delete(db_submission)
        db.commit()
        
        # Update leaderboard
        update_leaderboard_for_team(db, team_registration_id)
        return True
    return False

# TKR Leaderboard Functions
def create_initial_leaderboard_entry(db: Session, team_registration_id: int, tournament_id: int):
    """Create initial leaderboard entry for a new team registration"""
    leaderboard_entry = TKRLeaderboard(
        tournament_id=tournament_id,
        team_registration_id=team_registration_id,
        total_kills=0,
        total_score=0.0,
        games_submitted=0
    )
    db.add(leaderboard_entry)
    db.commit()

def update_leaderboard_for_team(db: Session, team_registration_id: int):
    """Recalculate and update leaderboard for a specific team"""
    # Get all game submissions for the team
    submissions = db.query(TKRGameSubmission).filter(
        TKRGameSubmission.team_registration_id == team_registration_id,
        TKRGameSubmission.status != SubmissionStatus.REJECTED
    ).all()
    
    # Calculate totals
    total_kills = sum(s.kills for s in submissions)
    total_score = sum(s.final_score or 0 for s in submissions)
    games_submitted = len(submissions)
    average_kills = total_kills / games_submitted if games_submitted > 0 else 0
    average_placement = sum(s.placement for s in submissions) / games_submitted if games_submitted > 0 else 0
    
    # Update leaderboard entry
    leaderboard_entry = db.query(TKRLeaderboard).filter(
        TKRLeaderboard.team_registration_id == team_registration_id
    ).first()
    
    if leaderboard_entry:
        leaderboard_entry.total_kills = total_kills
        leaderboard_entry.total_score = total_score
        leaderboard_entry.games_submitted = games_submitted
        leaderboard_entry.average_kills = average_kills
        leaderboard_entry.average_placement = average_placement
        leaderboard_entry.last_updated = datetime.utcnow()
        
        db.commit()
    
    # Recalculate ranks for all teams in the tournament
    update_tournament_leaderboard_ranks(db, leaderboard_entry.tournament_id)

def update_tournament_leaderboard_ranks(db: Session, tournament_id: int):
    """Recalculate ranks for all teams in a tournament"""
    # Get all leaderboard entries sorted by total_score (desc) then total_kills (desc)
    entries = db.query(TKRLeaderboard).filter(
        TKRLeaderboard.tournament_id == tournament_id
    ).order_by(
        TKRLeaderboard.total_score.desc(),
        TKRLeaderboard.total_kills.desc()
    ).all()
    
    # Update ranks
    for i, entry in enumerate(entries):
        entry.current_rank = i + 1
    
    db.commit()

def get_tkr_leaderboard(db: Session, tournament_id: int) -> List[TKRLeaderboard]:
    """Get full leaderboard for a tournament"""
    return db.query(TKRLeaderboard).options(
        joinedload(TKRLeaderboard.team_registration)
    ).filter(
        TKRLeaderboard.tournament_id == tournament_id
    ).order_by(
        TKRLeaderboard.current_rank.asc()
    ).all()

# TKR Template CRUD
def create_tkr_template(db: Session, template: TKRTemplateCreate, host_id: int) -> TKRTemplate:
    # Only set default tournament_days if not explicitly provided
    template_data = template.dict()
    
    # Use the provided tournament_days value or default to 3 for new templates
    if 'tournament_days' not in template_data or template_data['tournament_days'] == 7:
        template_data['tournament_days'] = template_data.get('tournament_days', 3)
    
    db_template = TKRTemplate(**template_data, host_id=host_id)
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def get_tkr_templates_by_host(db: Session, host_id: int) -> List[TKRTemplate]:
    return db.query(TKRTemplate).filter(
        TKRTemplate.host_id == host_id
    ).order_by(TKRTemplate.updated_at.desc()).all()

def get_tkr_template(db: Session, template_id: int) -> Optional[TKRTemplate]:
    return db.query(TKRTemplate).filter(TKRTemplate.id == template_id).first()

def update_tkr_template(
    db: Session, template_id: int, template_update: TKRTemplateUpdate
) -> Optional[TKRTemplate]:
    db_template = get_tkr_template(db, template_id)
    if not db_template:
        return None
    
    update_data = template_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_template, field, value)
    
    db_template.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_template)
    return db_template

def delete_tkr_template(db: Session, template_id: int) -> bool:
    db_template = get_tkr_template(db, template_id)
    if db_template:
        db.delete(db_template)
        db.commit()
        return True
    return False

# Prize Pool Calculation
def calculate_tkr_prize_pool(db: Session, tournament_id: int) -> Dict:
    """
    Calculate prize pool for a TKR tournament - FIXED VERSION
    Properly handles normal, rerunning, and partial free entry teams
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    config = get_tkr_config(db, tournament_id)
    
    if not tournament or not config:
        return {
            "tournament_id": tournament_id,
            "total_entries": 0,
            "base_entry_fee": 0.0,
            "total_collected": 0.0,
            "host_cut": 0.0,
            "final_prize_pool": 0.0,
            "show_prize_pool": False,
            "breakdown": {
                "normal_teams": 0,
                "rerunning_teams": 0,
                "free_entry_teams": 0,
                "partial_free_teams": 0
            }
        }
    
    # Get all team registrations
    registrations = get_tkr_team_registrations_by_tournament(db, tournament_id)
    
    # Parse base entry fee
    base_entry_fee = 0.0
    if tournament.entry_fee and tournament.entry_fee != 'Free':
        try:
            base_entry_fee = float(tournament.entry_fee.replace('$', ''))
        except (ValueError, AttributeError):
            base_entry_fee = 0.0
    
    # Initialize counters for breakdown
    total_entries = len(registrations)
    normal_teams = 0
    rerunning_teams = 0 
    free_entry_teams = 0
    partial_free_teams = 0
    total_collected = 0.0
    
    # Calculate contribution for each team registration
    for reg in registrations:
        team_contribution = 0.0
        
        # FIXED: Start with the base entry fee for this team
        if base_entry_fee > 0:
            team_base_fee = base_entry_fee
            
            # Apply rerunning discount (50% off entire team fee)
            if reg.is_rerunning:
                team_base_fee = base_entry_fee * 0.5
                rerunning_teams += 1
            else:
                normal_teams += 1
            
            # Handle free entry players (partial or complete free entry)
            if reg.using_free_entry and reg.free_entry_players:
                # Get team size from config to calculate per-player cost
                team_size_mapping = {
                    "SOLO": 1, "DUOS": 2, "TRIOS": 3, "QUADS": 4
                }
                team_size = team_size_mapping.get(str(config.team_size), 4)
                
                # Calculate per-player cost based on team's fee (after rerunning discount)
                per_player_cost = team_base_fee / team_size
                free_player_count = len(reg.free_entry_players)
                
                # Subtract cost for free entry players
                free_entry_discount = per_player_cost * free_player_count
                team_contribution = max(0, team_base_fee - free_entry_discount)
                
                # Track statistics
                if free_player_count >= team_size:
                    # Entire team is free
                    free_entry_teams += 1
                    if reg.is_rerunning:
                        rerunning_teams -= 1  # Don't double count
                    else:
                        normal_teams -= 1  # Don't double count
                else:
                    # Partial free entry
                    partial_free_teams += 1
                    
            else:
                # No free entry players - team pays full amount (after any rerunning discount)
                team_contribution = team_base_fee
        
        total_collected += team_contribution
    
    # Calculate host cut and final prize pool
    host_cut_percentage = config.host_percentage / 100.0 if config.host_percentage > 1 else config.host_percentage
    host_cut = total_collected * host_cut_percentage
    final_prize_pool = total_collected - host_cut
    
    return {
        "tournament_id": tournament_id,
        "total_entries": total_entries,
        "base_entry_fee": base_entry_fee,
        "total_collected": total_collected,
        "host_cut": host_cut,
        "final_prize_pool": final_prize_pool,
        "show_prize_pool": config.show_prize_pool,
        "breakdown": {
            "normal_teams": normal_teams,
            "rerunning_teams": rerunning_teams,
            "free_entry_teams": free_entry_teams,
            "partial_free_teams": partial_free_teams,
            "host_percentage": config.host_percentage,
            "host_cut_amount": host_cut
        }
    }
    
def get_tkr_game_submission(db: Session, submission_id: int) -> Optional[TKRGameSubmission]:
    """Get a single TKR game submission by ID"""
    return db.query(TKRGameSubmission).filter(
        TKRGameSubmission.id == submission_id
    ).first()