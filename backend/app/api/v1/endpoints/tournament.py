# app/api/v1/endpoints/tournament.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app import crud, schemas
from app.crud import tournament
from app.api import deps
from app.models.tournament import TournamentStatus
from app.models.team import Team
from app.models.match import Match
from app.models.losers_match import LosersMatch
from app.models.user import User, UserRole
from app.utils.BracketGenerator import generate_bracket, update_bracket

router = APIRouter()

def check_tournament_access(user: User, tournament_obj) -> bool:
    """Helper function to check if user has access to manage tournament"""
    return (user.role == UserRole.SUPER_ADMIN or 
            (user.role == UserRole.HOST and tournament_obj.creator_id == user.id))

@router.post("/", response_model=schemas.Tournament)
def create_tournament(
    tournament: schemas.TournamentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_host_or_super_admin)  # Only hosts and super admin can create
):
    return crud.tournament.create_tournament(
        db=db, 
        tournament=tournament, 
        creator_id=current_user.id
    )

@router.get("/{tournament_id}", response_model=schemas.Tournament)
def read_tournament(
    tournament_id: int, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)  # All active users can view
):
    db_tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return db_tournament

@router.get("/", response_model=List[schemas.Tournament])
def read_tournaments(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)  # All active users can view
):
    tournaments = crud.tournament.get_tournaments(db, skip=skip, limit=limit)
    # Add username to each tournament
    for tournament in tournaments:
        user = db.query(User).filter(User.id == tournament.creator_id).first()
        if user:
            setattr(tournament, 'creator_username', user.username)
    return tournaments

@router.put("/{tournament_id}", response_model=schemas.Tournament)
def update_tournament(
    tournament_id: int, 
    tournament_update: schemas.TournamentUpdate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    db_tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if not check_tournament_access(current_user, db_tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud.tournament.update_tournament(
        db=db, 
        tournament_id=tournament_id, 
        tournament_update=tournament_update
    )

@router.delete("/{tournament_id}", response_model=schemas.Tournament)
def delete_tournament(
    tournament_id: int, 
    db: Session = Depends(deps.get_db), 
    current_user: User = Depends(deps.get_current_active_user)
):
    db_tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if not check_tournament_access(current_user, db_tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return crud.tournament.delete_tournament(db=db, tournament_id=tournament_id)

@router.post("/{tournament_id}/start", response_model=schemas.Tournament)
def start_tournament(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if tournament.status != TournamentStatus.PENDING:
        raise HTTPException(status_code=400, detail="Tournament has already started or is completed")
    
    teams = crud.team.get_teams_by_tournament(db, tournament_id=tournament_id)
    if len(teams) < 2:
        raise HTTPException(status_code=400, detail="At least 2 teams are required to start a tournament")
    
    try:
        bracket_data = generate_bracket(tournament_id, teams, db)
        tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
        return tournament
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to generate bracket: {str(e)}")

@router.post("/{tournament_id}/reset", response_model=schemas.Tournament)
def reset_tournament(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        # Delete matches in correct order
        db.query(LosersMatch)\
            .filter(LosersMatch.tournament_id == tournament_id)\
            .update({LosersMatch.dropped_from_match_id: None}, synchronize_session=False)
        
        db.query(LosersMatch)\
            .filter(LosersMatch.tournament_id == tournament_id)\
            .delete(synchronize_session=False)
        
        db.query(Match)\
            .filter(Match.tournament_id == tournament_id)\
            .delete(synchronize_session=False)
        
        tournament.status = TournamentStatus.PENDING
        db.commit()
        db.refresh(tournament)
        
        return tournament
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{tournament_id}/end", response_model=schemas.Tournament)
def end_tournament(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if tournament.status != TournamentStatus.ONGOING:
        raise HTTPException(status_code=400, detail="Tournament is not ongoing")
    
    tournament.status = TournamentStatus.COMPLETED
    tournament.end_date = datetime.utcnow()
    db.commit()
    db.refresh(tournament)
    
    return tournament