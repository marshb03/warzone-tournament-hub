# app/crud/match.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.match import Match
from app.schemas.match import MatchCreate, MatchUpdate
from app.crud import leaderboard
from app.utils.bracket_generator import update_bracket as update_bracket_generator

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
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if db_match is None:
        return None
    
    for var, value in vars(match_update).items():
        setattr(db_match, var, value)
    
    if match_update.winner_id:
        # Update leaderboard entries
        leaderboard.create_or_update_leaderboard_entry(
            db, 
            tournament_id=db_match.tournament_id, 
            team_id=match_update.winner_id, 
            wins=1, 
            points=3
        )
        
        loser_id = db_match.team1_id if db_match.team1_id != match_update.winner_id else db_match.team2_id
        leaderboard.create_or_update_leaderboard_entry(
            db, 
            tournament_id=db_match.tournament_id, 
            team_id=loser_id, 
            losses=1
        )
        
        # Update bracket
        update_bracket_generator(match_id, match_update.winner_id, db)
    
    db.commit()
    db.refresh(db_match)
    return db_match