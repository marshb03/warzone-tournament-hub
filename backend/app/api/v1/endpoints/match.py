# app/api/v1/endpoints/match.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas.Match)
def create_match(match: schemas.MatchCreate, db: Session = Depends(deps.get_db)):
    return crud.match.create_match(db=db, match=match)

@router.get("/{match_id}", response_model=schemas.Match)
def read_match(match_id: int, db: Session = Depends(deps.get_db)):
    db_match = crud.match.get_match(db, match_id=match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

@router.get("/tournament/{tournament_id}", response_model=List[schemas.Match])
def read_matches_by_tournament(tournament_id: int, db: Session = Depends(deps.get_db)):
    return crud.match.get_matches_by_tournament(db, tournament_id=tournament_id)

@router.put("/{match_id}", response_model=schemas.Match)
def update_match(match_id: int, match_update: schemas.MatchUpdate, db: Session = Depends(deps.get_db)):
    db_match = crud.match.update_match(db, match_id=match_id, match_update=match_update)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match

@router.delete("/{match_id}", response_model=schemas.Match)
def delete_match(match_id: int, db: Session = Depends(deps.get_db)):
    db_match = crud.match.delete_match(db, match_id=match_id)
    if db_match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return db_match