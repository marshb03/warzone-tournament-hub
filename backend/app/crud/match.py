# app/crud/match.py
from sqlalchemy.orm import Session
from app.models.tournament import Match
from app.schemas.match import MatchCreate, MatchUpdate

def create_match(db: Session, match: MatchCreate):
    db_match = Match(**match.dict())
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

def get_match(db: Session, match_id: int):
    return db.query(Match).filter(Match.id == match_id).first()

def get_matches_by_tournament(db: Session, tournament_id: int):
    return db.query(Match).filter(Match.tournament_id == tournament_id).all()

def update_match(db: Session, match_id: int, match_update: MatchUpdate):
    db_match = get_match(db, match_id)
    if db_match:
        update_data = match_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_match, key, value)
        db.commit()
        db.refresh(db_match)
    return db_match

def delete_match(db: Session, match_id: int):
    db_match = get_match(db, match_id)
    if db_match:
        db.delete(db_match)
        db.commit()
    return db_match