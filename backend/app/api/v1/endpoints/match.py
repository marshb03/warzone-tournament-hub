# app/api/v1/endpoints/match.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from typing import List, Union
from datetime import datetime
import logging
from app import crud, schemas
from app.api import deps
from app.models.tournament import TournamentFormat, TournamentStatus
from app.models.match import Match
from app.models.losers_match import LosersMatch
from app.models.user import User, UserRole
from app.utils.WinnersBracket import WinnersBracket
from app.utils.LosersBracket import LosersBracket
from app.utils.ChampionshipMatches import ChampionshipMatches

router = APIRouter()
logger = logging.getLogger(__name__)

def check_tournament_access(user: User, tournament_obj) -> bool:
    """Helper function to check if user has access to manage tournament"""
    return (user.role == UserRole.SUPER_ADMIN or 
            (user.role == UserRole.HOST and tournament_obj.creator_id == user.id))

async def check_tournament_completion(db: Session, tournament_id: int, match: Match) -> bool:
    """
    Check if this match completion should mark the tournament as complete.
    Returns True if tournament should be completed.
    """
    tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    
    logger.info(f"Checking completion for tournament {tournament_id} (format: {tournament.format})")
    logger.info(f"Current match: Round {match.round}")
    
    if tournament.format == TournamentFormat.SINGLE_ELIMINATION:
        highest_round = db.query(func.max(Match.round))\
            .filter(
                Match.tournament_id == tournament_id,
                Match.round < 98
            ).scalar()
        
        logger.info(f"Single elimination - Highest round: {highest_round}, Current round: {match.round}")
        return match.round == highest_round
        
    elif tournament.format == TournamentFormat.DOUBLE_ELIMINATION:
        if match.round == 99:
            logger.info("Double elimination - Reset bracket final completed")
            return True
        elif match.round == 98:
            is_complete = match.team1_id == match.winner_id
            logger.info(f"Double elimination - Championship match completed, tournament complete: {is_complete}")
            return is_complete
            
    return False

@router.get("/{match_id}", response_model=Union[schemas.Match, schemas.LosersMatch])
def read_match(
    match_id: int, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get a specific match by ID"""
    # Try winners bracket first
    db_match = crud.match.get_match(db, match_id=match_id)
    if db_match is not None:
        return db_match
    
    # Try losers bracket if not found
    db_losers_match = crud.losers_match.get_match(db, match_id=match_id)
    if db_losers_match is not None:
        return db_losers_match
    
    raise HTTPException(status_code=404, detail="Match not found")

@router.get("/tournament/{tournament_id}", response_model=schemas.TournamentBracketResponse)
def read_matches_by_tournament(
    tournament_id: int,
    db: Session = Depends(deps.get_db)
):
    """Get all matches for a specific tournament"""
    tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Get winners bracket matches
    matches = db.query(Match).options(
        joinedload(Match.team1),
        joinedload(Match.team2),
        joinedload(Match.winner),
        joinedload(Match.loser)
    ).filter(Match.tournament_id == tournament_id).all()
    
    # Get losers bracket matches
    losers_matches = db.query(LosersMatch).options(
        joinedload(LosersMatch.team1),
        joinedload(LosersMatch.team2),
        joinedload(LosersMatch.winner)
    ).filter(
        LosersMatch.tournament_id == tournament_id
    ).all()
    
    winners_bracket = [m for m in matches if m.round < 98]
    finals = [m for m in matches if m.round >= 98]
    total_rounds = max((m.round for m in winners_bracket), default=0)

    return schemas.TournamentBracketResponse(
        tournament_id=tournament_id,
        winners_bracket=winners_bracket,
        finals=finals,
        losers_bracket=losers_matches,
        total_rounds=total_rounds
    )

@router.put("/winners/{match_id}", response_model=schemas.Match)
async def update_winners_match(
    match_id: int, 
    match_update: schemas.MatchUpdate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Update a winners bracket match"""
    match = crud.match.get_match(db, match_id=match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    tournament = crud.tournament.get_tournament(db, tournament_id=match.tournament_id)
    
    if not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if tournament.status != TournamentStatus.ONGOING:
        raise HTTPException(
            status_code=400,
            detail="Matches can only be updated in ongoing tournaments"
        )
    
    try:
        updated_match = WinnersBracket.update_match(match_id, match_update.winner_id, db)
        
        # Check if tournament should be completed
        should_complete = await check_tournament_completion(db, tournament.id, updated_match)
        if should_complete:
            tournament.status = TournamentStatus.COMPLETED
            tournament.end_date = datetime.utcnow()
            db.commit()
            logger.info(f"Tournament {tournament.id} marked as completed")
        
        return updated_match
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/losers/{match_id}", response_model=schemas.LosersMatch)
def update_losers_match(
    match_id: int, 
    match_update: schemas.MatchUpdate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Update a losers bracket match"""
    match = crud.losers_match.get_match(db, match_id=match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    tournament = crud.tournament.get_tournament(db, tournament_id=match.tournament_id)
    
    if not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if tournament.status != TournamentStatus.ONGOING:
        raise HTTPException(
            status_code=400,
            detail="Matches can only be updated in ongoing tournaments"
        )
    
    try:
        return LosersBracket.update_match(match_id, match_update.winner_id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/championship/{match_id}", response_model=schemas.Match)
async def update_championship_match(
    match_id: int, 
    match_update: schemas.MatchUpdate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Update a championship match"""
    match = crud.match.get_match(db, match_id=match_id)
    if not match or match.round not in [98, 99]:
        raise HTTPException(status_code=404, detail="Championship match not found")
    
    tournament = crud.tournament.get_tournament(db, tournament_id=match.tournament_id)
    
    if not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if tournament.status != TournamentStatus.ONGOING:
        raise HTTPException(
            status_code=400,
            detail="Matches can only be updated in ongoing tournaments"
        )
    
    try:
        updated_match = ChampionshipMatches.update_match(match_id, match_update.winner_id, db)
        
        # Check if tournament should be completed
        should_complete = await check_tournament_completion(db, tournament.id, updated_match)
        if should_complete:
            tournament.status = TournamentStatus.COMPLETED
            tournament.end_date = datetime.utcnow()
            db.commit()
            logger.info(f"Tournament {tournament.id} marked as completed after championship match")
        
        return updated_match
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))