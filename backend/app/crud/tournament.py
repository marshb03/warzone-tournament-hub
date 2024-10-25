# app/crud/tournament.py
from sqlalchemy.orm import Session
from app.models.tournament import Tournament, TournamentFormat, TournamentStatus
from app.models import Match
from app.schemas.tournament import TournamentUpdate, TournamentCreate

def create_tournament(db: Session, tournament: TournamentCreate, creator_id: int):
    db_tournament = Tournament(
        name=tournament.name,
        format=TournamentFormat[tournament.format],
        start_date=tournament.start_date,
        end_date=tournament.end_date,
        creator_id=creator_id,
        status=TournamentStatus.PENDING
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
