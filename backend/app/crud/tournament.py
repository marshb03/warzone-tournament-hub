# app/crud/tournament.py - FIXED: Consistent payment field handling
from sqlalchemy.orm import Session, joinedload
from app.models.tournament import Tournament, TournamentFormat, TournamentStatus
from app.models import Match, Team
from app.schemas.tournament import TournamentUpdate, TournamentCreate, TournamentBracketConfig

def create_tournament(db: Session, tournament: TournamentCreate, creator_id: int) -> Tournament:
    """Create a new tournament with payment information"""
    db_tournament = Tournament(
        name=tournament.name,
        format=tournament.format,
        start_date=tournament.start_date,
        start_time=tournament.start_time,
        end_date=tournament.end_date,
        end_time=tournament.end_time,
        team_size=tournament.team_size,
        max_teams=tournament.max_teams,
        creator_id=creator_id,
        description=tournament.description,
        rules=tournament.rules,
        entry_fee=tournament.entry_fee,
        game=tournament.game,
        game_mode=tournament.game_mode,
        # FIXED: Payment fields - consistent names
        payment_methods=tournament.payment_methods,
        payment_details=tournament.payment_details,
        payment_instructions=tournament.payment_instructions
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
    """Update tournament details including payment information"""
    db_tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not db_tournament:
        return None
    
    update_data = tournament_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tournament, field, value)
    
    # Handle bracket_config separately if it exists
    if 'bracket_config' in update_data and update_data['bracket_config']:
        # If it's already a dict, use it as is
        if isinstance(update_data['bracket_config'], dict):
            pass
        # If it's a Pydantic model, convert to dict
        elif hasattr(update_data['bracket_config'], 'dict'):
            update_data['bracket_config'] = update_data['bracket_config'].dict()
    
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

def delete_tournament(db: Session, tournament_id: int):
    db_tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if db_tournament:
        db.delete(db_tournament)
        db.commit()
        return True
    return False

def get_tournament_creator(db: Session, tournament_id: int):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    return tournament.creator_id if tournament else None

def get_tournaments_by_status(db: Session, status: TournamentStatus, skip: int = 0, limit: int = 100):
    return db.query(Tournament)\
        .options(joinedload(Tournament.creator))\
        .filter(Tournament.status == status)\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_upcoming_tournaments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Tournament)\
        .options(joinedload(Tournament.creator))\
        .filter(Tournament.status == TournamentStatus.PENDING)\
        .offset(skip)\
        .limit(limit)\
        .all()

def start_tournament(db: Session, tournament_id: int):
    db_tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if db_tournament:
        db_tournament.status = TournamentStatus.ONGOING
        db.commit()
        db.refresh(db_tournament)
        return db_tournament
    return None

def complete_tournament(db: Session, tournament_id: int):
    db_tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if db_tournament:
        db_tournament.status = TournamentStatus.COMPLETED
        db.commit()
        db.refresh(db_tournament)
        return db_tournament
    return None

def reset_tournament(db: Session, tournament_id: int):
    """Reset tournament to PENDING status and clear matches"""
    db_tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if db_tournament:
        # Clear all matches associated with this tournament
        db.query(Match).filter(Match.tournament_id == tournament_id).delete()
        
        # Reset tournament status
        db_tournament.status = TournamentStatus.PENDING
        db_tournament.current_teams = len(db_tournament.teams)
        
        db.commit()
        db.refresh(db_tournament)
        return db_tournament
    return None