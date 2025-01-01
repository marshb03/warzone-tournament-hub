# app/api/v1/endpoints/match.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Union
from app import crud, schemas
from app.api import deps
from app.models.tournament import TournamentFormat
from app.models.match import Match
from app.models.losers_match import LosersMatch
from app.utils.BracketGenerator import update_bracket
from app.schemas.match import BracketMatch, TournamentBracketResponse

router = APIRouter()

@router.post("/", response_model=schemas.Match)
def create_match(match: schemas.MatchCreate, db: Session = Depends(deps.get_db)):
    return crud.match.create_match(db=db, match=match)

@router.post("/losers", response_model=schemas.LosersMatch)
def create_losers_match(match: schemas.LosersMatchCreate, db: Session = Depends(deps.get_db)):
    return crud.losers_match.create_match(db=db, match=match)

@router.get("/{match_id}", response_model=Union[schemas.Match, schemas.LosersMatch])
def read_match(match_id: int, db: Session = Depends(deps.get_db)):
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
def read_matches_by_tournament(tournament_id: int, db: Session = Depends(deps.get_db)):
    """Get all winners bracket and championship matches for a tournament."""
    tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Get all matches for the tournament
    matches = db.query(Match)\
        .options(
            joinedload(Match.team1),
            joinedload(Match.team2),
            joinedload(Match.winner),
            joinedload(Match.loser)
        )\
        .filter(Match.tournament_id == tournament_id)\
        .all()
    
    # Separate matches into winners bracket and championship matches
    winners_bracket = [m for m in matches if m.round < 98]
    finals = [m for m in matches if m.round >= 98]
    
    # Calculate total rounds (excluding championship rounds)
    total_rounds = max((m.round for m in winners_bracket), default=0)

    return schemas.TournamentBracketResponse(
        tournament_id=tournament_id,
        winners_bracket=winners_bracket,
        finals=finals,
        total_rounds=total_rounds
    )

@router.put("/{match_id}", response_model=Union[schemas.Match, schemas.LosersMatch])
def update_match(match_id: int, match_update: schemas.MatchUpdate, db: Session = Depends(deps.get_db)):
    # Try to update winners bracket match
    db_match = crud.match.get_match(db, match_id=match_id)
    if db_match is not None:
        try:
            # Use the new update_bracket function instead of crud.match.update_match
            updated_match = update_bracket(match_id, match_update.winner_id, db)
            return updated_match
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
    
    # Try to update losers bracket match (keep existing logic for now)
    db_losers_match = crud.losers_match.get_match(db, match_id=match_id)
    if db_losers_match is not None:
        updated_match = crud.losers_match.update_match(db, match_id=match_id, match_update=match_update)
        if updated_match is None:
            raise HTTPException(status_code=404, detail="Match not found")
        return updated_match
    
    raise HTTPException(status_code=404, detail="Match not found")

@router.delete("/{match_id}", response_model=Union[schemas.Match, schemas.LosersMatch])
def delete_match(match_id: int, db: Session = Depends(deps.get_db)):
    # Try to delete winners bracket match
    db_match = crud.match.delete_match(db, match_id=match_id)
    if db_match is not None:
        return db_match
    
    # Try to delete losers bracket match
    db_losers_match = crud.losers_match.delete_match(db, match_id=match_id)
    if db_losers_match is not None:
        return db_losers_match
    
    raise HTTPException(status_code=404, detail="Match not found")

@router.put("/losers/{match_id}", response_model=schemas.LosersMatch)
async def update_losers_match(
    match_id: int, 
    match_update: schemas.MatchUpdate,
    db: Session = Depends(deps.get_db)
):
    """Update a losers bracket match with the winner."""
    try:
        updated_match = crud.losers_match.update_match(
            db=db,
            match_id=match_id,
            match_update=match_update
        )
        
        if updated_match is None:
            raise HTTPException(status_code=404, detail="Match not found")
            
        return updated_match
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))