# app/crud/losers_match.py
from sqlalchemy.orm import Session
from app.models.losers_match import LosersMatch
from app.models.match import Match  # Add this import
from app.schemas.match import MatchUpdate
from fastapi import HTTPException
from sqlalchemy import func
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

def get_match(db: Session, match_id: int):
    logger.debug(f"Looking up losers match with ID: {match_id}")
    match = db.query(LosersMatch).filter(LosersMatch.id == match_id).first()
    logger.debug(f"Found losers match: {match}")
    return match

def get_matches_by_tournament(db: Session, tournament_id: int):
    return db.query(LosersMatch)\
        .filter(LosersMatch.tournament_id == tournament_id)\
        .order_by(LosersMatch.round, LosersMatch.match_number)\
        .all()

def update_match(db: Session, match_id: int, match_update: MatchUpdate):
    """
    Update a losers bracket match with winner.
    Progression logic is handled by BracketGenerator.
    """
    match = get_match(db, match_id=match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if match_update.winner_id not in [match.team1_id, match.team2_id]:
        raise HTTPException(
            status_code=400,
            detail="Winner must be one of the teams in the match"
        )

    # Update winner only
    match.winner_id = match_update.winner_id
    db.commit()
    db.refresh(match)
    return match