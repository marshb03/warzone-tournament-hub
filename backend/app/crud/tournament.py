# app/crud/tournament.py
from sqlalchemy.orm import Session, joinedload
from app.models.tournament import Tournament, TournamentFormat, TournamentStatus
from app.models import Match, Team
from app.schemas.tournament import TournamentUpdate, TournamentCreate, TournamentBracketConfig

def create_tournament(db: Session, tournament: TournamentCreate, creator_id: int):
    db_tournament = Tournament(
        name=tournament.name,
        format=TournamentFormat[tournament.format],
        start_date=tournament.start_date,
        start_time=tournament.start_time,
        end_date=tournament.end_date,
        team_size=tournament.team_size,
        max_teams=tournament.max_teams,
        creator_id=creator_id,
        status=TournamentStatus.PENDING,
        current_teams=0,
        bracket_config=tournament.bracket_config.dict() if tournament.bracket_config else None
    )
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

def get_tournament(db: Session, tournament_id: int):
    return db.query(Tournament)\
        .options(joinedload(Tournament.creator))\
        .filter(Tournament.id == tournament_id)\
        .first()

def get_tournaments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Tournament)\
        .options(joinedload(Tournament.creator))\
        .offset(skip)\
        .limit(limit)\
        .all()

def update_tournament(db: Session, tournament_id: int, tournament_update: TournamentUpdate):
    db_tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not db_tournament:
        return None
    
    # Convert the model to a dict, excluding unset values
    update_data = tournament_update.dict(exclude_unset=True)
    
    # Handle bracket_config separately if it exists
    if 'bracket_config' in update_data and update_data['bracket_config']:
        # If it's already a dict, use it as is
        if isinstance(update_data['bracket_config'], dict):
            pass
        # If it's a Pydantic model, convert to dict
        elif hasattr(update_data['bracket_config'], 'dict'):
            update_data['bracket_config'] = update_data['bracket_config'].dict()
    
    # Update the tournament attributes
    for field, value in update_data.items():
        setattr(db_tournament, field, value)
    
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

def delete_tournament(db: Session, tournament_id: int):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if tournament:
        db.delete(tournament)
        db.commit()
    return tournament

def update_team_count(db: Session, tournament_id: int) -> int:
    count = db.query(Team).filter(Team.tournament_id == tournament_id).count()
    tournament = get_tournament(db, tournament_id=tournament_id)
    if tournament:
        tournament.current_teams = count
        db.commit()
        db.refresh(tournament)
    return count

def can_add_team(db: Session, tournament_id: int) -> bool:
    tournament = get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        return False
    return tournament.current_teams < tournament.max_teams

def get_default_bracket_config() -> dict:
    """Get default bracket configuration."""
    return TournamentBracketConfig().dict()

def validate_tournament_state(tournament: Tournament) -> bool:
    """Validate tournament state for operations."""
    if not tournament:
        return False
    if tournament.status == TournamentStatus.COMPLETED:
        return False
    if tournament.current_teams < 4:
        return False
    if tournament.current_teams > 32:
        return False
    return True