# app/crud/crud_leaderboard.py
from sqlalchemy.orm import Session
from app.models.leaderboard import LeaderboardEntry
from app.schemas.leaderboard import LeaderboardEntryCreate

def create_or_update_leaderboard_entry(db: Session, entry: LeaderboardEntryCreate):
    db_entry = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.tournament_id == entry.tournament_id,
        LeaderboardEntry.team_id == entry.team_id
    ).first()

    if db_entry:
        for key, value in entry.dict().items():
            setattr(db_entry, key, value)
    else:
        db_entry = LeaderboardEntry(**entry.dict())
        db.add(db_entry)

    db.commit()
    db.refresh(db_entry)
    return db_entry

def get_tournament_leaderboard(db: Session, tournament_id: int):
    return db.query(LeaderboardEntry).filter(LeaderboardEntry.tournament_id == tournament_id).order_by(LeaderboardEntry.points.desc()).all()