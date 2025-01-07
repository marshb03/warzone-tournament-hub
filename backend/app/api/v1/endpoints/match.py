# app/api/v1/endpoints/match.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Union
from app import crud, schemas
from app.api import deps
from app.models.tournament import TournamentFormat, TournamentStatus
from app.models.match import Match
from app.models.losers_match import LosersMatch
from app.models.user import User, UserRole
from app.utils.BracketGenerator import update_bracket
from app.schemas.match import BracketMatch, TournamentBracketResponse

router = APIRouter()

def check_tournament_access(user: User, tournament_obj) -> bool:
    """Helper function to check if user has access to manage tournament"""
    return (user.role == UserRole.SUPER_ADMIN or 
            (user.role == UserRole.HOST and tournament_obj.creator_id == user.id))


@router.get("/{match_id}", response_model=Union[schemas.Match, schemas.LosersMatch])
def read_match(
    match_id: int, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
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
    tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    matches = db.query(Match)\
        .options(
            joinedload(Match.team1),
            joinedload(Match.team2),
            joinedload(Match.winner),
            joinedload(Match.loser)
        )\
        .filter(Match.tournament_id == tournament_id)\
        .all()
    
    winners_bracket = [m for m in matches if m.round < 98]
    finals = [m for m in matches if m.round >= 98]
    total_rounds = max((m.round for m in winners_bracket), default=0)

    return schemas.TournamentBracketResponse(
        tournament_id=tournament_id,
        winners_bracket=winners_bracket,
        finals=finals,
        total_rounds=total_rounds
    )

@router.put("/{match_id}", response_model=Union[schemas.Match, schemas.LosersMatch])
def update_match(
    match_id: int, 
    match_update: schemas.MatchUpdate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    # Get the match and tournament
    match = crud.match.get_match(db, match_id=match_id)
    losers_match = None if match else crud.losers_match.get_match(db, match_id=match_id)
    
    if not match and not losers_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    tournament_id = match.tournament_id if match else losers_match.tournament_id
    tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    
    # Check permissions
    if not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check tournament status
    if tournament.status != TournamentStatus.ONGOING:
        raise HTTPException(
            status_code=400,
            detail="Matches can only be updated in ongoing tournaments"
        )
    
    try:
        if match:
            return update_bracket(match_id, match_update.winner_id, db)
        else:
            updated_match = crud.losers_match.update_match(
                db, match_id=match_id, match_update=match_update
            )
            if not updated_match:
                raise HTTPException(status_code=404, detail="Match not found")
            return updated_match
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
