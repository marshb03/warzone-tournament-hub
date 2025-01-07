# app/api/v1/endpoints/team.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.api import deps
from app.models.user import User, UserRole
from app.models.tournament import TournamentStatus

router = APIRouter()

def check_tournament_access(user: User, tournament_obj) -> bool:
    """Helper function to check if user has access to manage tournament"""
    return (user.role == UserRole.SUPER_ADMIN or 
            (user.role == UserRole.HOST and tournament_obj.creator_id == user.id))

@router.post("/", response_model=schemas.Team)
def create_team(
    team: schemas.TeamCreate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    # Get tournament to check permissions
    tournament = crud.tournament.get_tournament(db, tournament_id=team.tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Check permissions
    if not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check tournament status
    if tournament.status != TournamentStatus.PENDING:
        raise HTTPException(
            status_code=400, 
            detail="Teams can only be added to pending tournaments"
        )
    
    # Check max teams
    if not crud.tournament.can_add_team(db, team.tournament_id):
        raise HTTPException(
            status_code=400,
            detail="Tournament has reached maximum team capacity"
        )
    
    # Create the team
    new_team = crud.team.create_team(db=db, team=team)
    
    # Update tournament team count
    crud.tournament.update_team_count(db, team.tournament_id)
    
    return new_team

@router.delete("/{team_id}", response_model=schemas.Team)
def delete_team(
    team_id: int, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    # Get team and tournament
    team = crud.team.get_team(db, team_id=team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    tournament = crud.tournament.get_tournament(db, tournament_id=team.tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Check permissions
    if not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check tournament status
    if tournament.status != TournamentStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Teams can only be removed from pending tournaments"
        )
    
    deleted_team = crud.team.delete_team(db, team_id=team_id)
    crud.tournament.update_team_count(db, tournament.id)
    
    return deleted_team

@router.put("/{team_id}", response_model=schemas.Team)
def update_team(
    team_id: int, 
    team_update: schemas.TeamUpdate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    # Get team and tournament
    team = crud.team.get_team(db, team_id=team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    tournament = crud.tournament.get_tournament(db, tournament_id=team.tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Check permissions
    if not check_tournament_access(current_user, tournament):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check tournament status
    if tournament.status != TournamentStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Teams can only be modified in pending tournaments"
        )
    
    return crud.team.update_team(db, team_id=team_id, team_update=team_update)

# Read operations remain unchanged as they should be accessible to all users
@router.get("/{team_id}", response_model=schemas.Team)
def read_team(team_id: int, db: Session = Depends(deps.get_db)):
    db_team = crud.team.get_team(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_team

@router.get("/tournament/{tournament_id}", response_model=List[schemas.Team])
def read_teams_by_tournament(tournament_id: int, db: Session = Depends(deps.get_db)):
    teams = crud.team.get_teams_by_tournament(db, tournament_id=tournament_id)
    return teams