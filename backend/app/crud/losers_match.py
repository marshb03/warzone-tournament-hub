# app/crud/losers_match.py
from sqlalchemy.orm import Session
from app.models.losers_match import LosersMatch
from app.models.match import Match  # Add this import
from app.schemas.match import MatchUpdate
from fastapi import HTTPException
from sqlalchemy import func
import logging
logging.basicConfig(
    filename='tournament_debug.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def get_match(db: Session, match_id: int):
    return db.query(LosersMatch).filter(LosersMatch.id == match_id).first()

def get_matches_by_tournament(db: Session, tournament_id: int):
    return db.query(LosersMatch)\
        .filter(LosersMatch.tournament_id == tournament_id)\
        .order_by(LosersMatch.round, LosersMatch.match_number)\
        .all()

def update_match(db: Session, match_id: int, match_update: MatchUpdate):
    """
    Update a losers bracket match with the winner and handle progression
    to the next round if applicable.
    """
    match = get_match(db, match_id=match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if match_update.winner_id not in [match.team1_id, match.team2_id]:
        raise HTTPException(
            status_code=400,
            detail="Winner must be one of the teams in the match"
        )

    # Update winner
    match.winner_id = match_update.winner_id
    db.flush()  # Flush to ensure winner_id is set

    # Get the highest round number in losers bracket for this tournament
    max_round = db.query(func.max(LosersMatch.round))\
        .filter(LosersMatch.tournament_id == match.tournament_id)\
        .scalar()

    # Check if this is the final losers bracket match
    if match.round == max_round and match.match_number == 101:
        logging.debug(f"Processing final losers match. Winner: {match_update.winner_id}")
        # Get championship match
        championship_match = db.query(Match).filter(
            Match.tournament_id == match.tournament_id,
            Match.round == 98,
            Match.match_number == 201
        ).first()

        if championship_match:
            logging.debug(f"Found championship match. Current state: team1_id={championship_match.team1_id}, team2_id={championship_match.team2_id}")
            # Update championship match with losers bracket winner
            championship_match.team2_id = match_update.winner_id
            db.flush()
            logging.debug(f"Updated championship match. New state: team1_id={championship_match.team1_id}, team2_id={championship_match.team2_id}")

    # Handle progression to next match if it exists
    elif match.next_match_id:
        next_match = get_match(db, match_id=match.next_match_id)
        if next_match:
            # Place winner in appropriate position
            if not next_match.team1_id:
                next_match.team1_id = match_update.winner_id
            else:
                next_match.team2_id = match_update.winner_id

    db.commit()
    db.refresh(match)
    return match