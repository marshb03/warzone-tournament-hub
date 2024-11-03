# app/api/v1/endpoints/match.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Union
from app import crud, schemas
from app.api import deps
from app.models.tournament import TournamentFormat

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

@router.get("/tournament/{tournament_id}", response_model=Union[List[schemas.Match], schemas.DoubleBracketResponse])
def read_matches_by_tournament(tournament_id: int, db: Session = Depends(deps.get_db)):
    tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.format == TournamentFormat.SINGLE_ELIMINATION:
        return crud.match.get_matches_by_tournament(db, tournament_id=tournament_id)
    else:
        winners_matches = crud.match.get_matches_by_tournament(db, tournament_id=tournament_id)
        losers_matches = crud.losers_match.get_matches_by_tournament(db, tournament_id=tournament_id)
        finals_matches = [m for m in winners_matches if m.round >= max(m.round for m in winners_matches) - 1]
        regular_winners = [m for m in winners_matches if m not in finals_matches]
        
        return schemas.DoubleBracketResponse(
            tournament_id=tournament_id,
            winners_bracket=regular_winners,
            losers_bracket=losers_matches,
            finals=finals_matches,
            total_rounds=max(match.round for match in winners_matches) if winners_matches else 0
        )

@router.put("/{match_id}", response_model=Union[schemas.Match, schemas.LosersMatch])
def update_match(match_id: int, match_update: schemas.MatchUpdate, db: Session = Depends(deps.get_db)):
    # Try to update winners bracket match
    db_match = crud.match.get_match(db, match_id=match_id)
    if db_match is not None:
        updated_match = crud.match.update_match(db, match_id=match_id, match_update=match_update)
        if updated_match is None:
            raise HTTPException(status_code=404, detail="Match not found")
        return updated_match
    
    # Try to update losers bracket match
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