from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.crud import leaderboard, tournament
from app.schemas.leaderboard import LeaderboardEntry
from app.api import deps
from typing import List

router = APIRouter()

@router.get("/tournament/{tournament_id}", response_model=List[LeaderboardEntry])
def get_tournament_leaderboard(tournament_id: int, db: Session = Depends(deps.get_db)):
    db_tournament = tournament.get_tournament(db, tournament_id)
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    leaderboard_entries = leaderboard.get_tournament_leaderboard(db, tournament_id)
    if not leaderboard_entries:
        raise HTTPException(status_code=404, detail="Leaderboard not found")
    return leaderboard_entries