# app/api/v1/endpoints/leaderboard.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/{tournament_id}/leaderboard", response_model=List[schemas.LeaderboardEntry])
def get_tournament_leaderboard(
    tournament_id: int,
    db: Session = Depends(deps.get_db)
):
    tournament = crud.crud_tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    return crud.crud_leaderboard.get_tournament_leaderboard(db, tournament_id=tournament_id)