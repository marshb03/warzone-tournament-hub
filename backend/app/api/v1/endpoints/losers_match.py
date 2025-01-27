# app/api/v1/endpoints/losers_match.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app import crud, schemas
from app.api import deps
from app.models.losers_match import LosersMatch

router = APIRouter()

@router.get("/tournament/{tournament_id}", response_model=List[schemas.LosersMatch])
def read_losers_matches_by_tournament(tournament_id: int, db: Session = Depends(deps.get_db)):
    """Get all losers bracket matches for a tournament."""
    try:
        losers_matches = (
            db.query(LosersMatch)
            .filter(LosersMatch.tournament_id == tournament_id)
            .options(
                joinedload(LosersMatch.team1),
                joinedload(LosersMatch.team2),
                joinedload(LosersMatch.winner)
            )
            .order_by(LosersMatch.round, LosersMatch.match_number)
            .all()
        )
        
        # Log the data to verify it's being sent correctly
        for match in losers_matches:
            print(f"Match {match.match_number} progression data:")
            print(f"Team1: Round {match.team1_winners_round} Match {match.team1_winners_match_number}")
            print(f"Team2: Round {match.team2_winners_round} Match {match.team2_winners_match_number}")
        
        return losers_matches
        
    except Exception as e:
        print(f"Error in losers matches endpoint: {str(e)}")
        raise