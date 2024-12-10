# app/crud/tournament.py
from sqlalchemy.orm import Session
from app.models.tournament import Tournament, TournamentFormat, TournamentStatus
from app.models import Match, Team
from app.schemas.tournament import TournamentUpdate, TournamentCreate

# app/crud/tournament.py
def create_tournament(db: Session, tournament: TournamentCreate, creator_id: int):
    db_tournament = Tournament(
        name=tournament.name,
        format=TournamentFormat[tournament.format],
        start_date=tournament.start_date,
        start_time=tournament.start_time,  # Add this
        end_date=tournament.end_date,
        team_size=tournament.team_size,    # Add this
        max_teams=tournament.max_teams,    # Add this
        creator_id=creator_id,
        status=TournamentStatus.PENDING,
        current_teams=0
    )
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

def get_tournament(db: Session, tournament_id: int):
    return db.query(Tournament).filter(Tournament.id == tournament_id).first()

def get_tournaments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Tournament).offset(skip).limit(limit).all()

def update_tournament(db: Session, tournament_id: int, tournament_update: TournamentUpdate):
    db_tournament = get_tournament(db, tournament_id)
    if db_tournament:
        update_data = tournament_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_tournament, key, value)
        db.commit()
        db.refresh(db_tournament)
    return db_tournament

def delete_tournament(db: Session, tournament_id: int):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if tournament:
        db.delete(tournament)
        db.commit()
    return tournament

# app/crud/tournament.py

def update_team_count(db: Session, tournament_id: int) -> int:
    """Update the current_teams count for a tournament"""
    count = db.query(Team).filter(Team.tournament_id == tournament_id).count()
    tournament = get_tournament(db, tournament_id=tournament_id)
    if tournament:
        tournament.current_teams = count
        db.commit()
        db.refresh(tournament)
    return count

# Add validation method
def can_add_team(db: Session, tournament_id: int) -> bool:
    """Check if a team can be added to the tournament"""
    tournament = get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        return False
    return tournament.current_teams < tournament.max_teams