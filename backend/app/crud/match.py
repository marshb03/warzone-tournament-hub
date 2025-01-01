# app/crud/match.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.match import Match
from app.schemas.match import MatchCreate, MatchUpdate
from app.crud import leaderboard
from fastapi import HTTPException
from typing import Optional, List

def create_match(db: Session, match: MatchCreate) -> Match:
    """Create a new match."""
    db_match = Match(**match.dict())
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

def get_match(db: Session, match_id: int) -> Optional[Match]:
    """Get a single match by ID."""
    return db.query(Match).filter(Match.id == match_id).first()

def get_matches_by_tournament(db: Session, tournament_id: int) -> List[Match]:
    """Get all matches for a tournament, ordered by round and match number."""
    return db.query(Match)\
        .filter(Match.tournament_id == tournament_id)\
        .order_by(Match.round, Match.match_number)\
        .all()

def get_matches_by_round(db: Session, tournament_id: int, round_number: int) -> List[Match]:
    """Get all matches for a specific round in a tournament."""
    return db.query(Match)\
        .filter(
            Match.tournament_id == tournament_id,
            Match.round == round_number
        )\
        .order_by(Match.match_number)\
        .all()

def update_match(db: Session, match_id: int, match_update: MatchUpdate) -> Optional[Match]:
    """
    Update a match with its winner and handle progression logic.
    This function is mainly used for direct updates that don't involve bracket progression.
    For bracket progression, use BracketGenerator.update_bracket instead.
    """
    db_match = get_match(db, match_id=match_id)
    if db_match is None:
        return None

    # Validate winner is part of the match
    if match_update.winner_id not in [db_match.team1_id, db_match.team2_id]:
        raise HTTPException(
            status_code=400,
            detail="Winner must be one of the teams in the match"
        )

    # Update winner and loser
    db_match.winner_id = match_update.winner_id
    db_match.loser_id = db_match.team1_id if db_match.team1_id != match_update.winner_id else db_match.team2_id

    # Update leaderboard entries
    if match_update.winner_id:
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
            losses=1,
            points=0
        )

    db.commit()
    db.refresh(db_match)
    return db_match

def delete_match(db: Session, match_id: int) -> Optional[Match]:
    """Delete a match."""
    match = get_match(db, match_id=match_id)
    if match:
        # Clear next_match references first
        db.query(Match)\
            .filter(Match.next_match_id == match_id)\
            .update({Match.next_match_id: None})
        
        db.delete(match)
        db.commit()
    return match

def get_final_match(db: Session, tournament_id: int) -> Optional[Match]:
    """Get the final match of a tournament."""
    max_round = db.query(func.max(Match.round))\
        .filter(Match.tournament_id == tournament_id)\
        .scalar()
    
    if max_round:
        return db.query(Match)\
            .filter(
                Match.tournament_id == tournament_id,
                Match.round == max_round
            )\
            .first()
    return None

def get_match_by_position(db: Session, tournament_id: int, round_number: int, 
                         match_number: int) -> Optional[Match]:
    """Get a match by its position in the bracket."""
    return db.query(Match)\
        .filter(
            Match.tournament_id == tournament_id,
            Match.round == round_number,
            Match.match_number == match_number
        )\
        .first()

def get_next_matches(db: Session, match_id: int) -> List[Match]:
    """Get all matches that follow from this match."""
    return db.query(Match)\
        .filter(Match.next_match_id == match_id)\
        .all()

def validate_match_update(db: Session, match_id: int, winner_id: int) -> bool:
    """
    Validate if a match can be updated with the given winner.
    Returns True if valid, False otherwise.
    """
    match = get_match(db, match_id)
    if not match:
        return False
        
    # Check if winner is part of the match
    if winner_id not in [match.team1_id, match.team2_id]:
        return False
        
    # Check if match already has a winner
    if match.winner_id is not None:
        return False
        
    # Check if all previous matches are completed
    prev_matches = get_next_matches(db, match_id)
    for prev_match in prev_matches:
        if prev_match.winner_id is None:
            return False
            
    return True