# app/api/v1/endpoints/team.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=schemas.Team)
def create_team(
    team: schemas.TeamCreate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)  # This line is crucial
):
    # Add some debug logging
    #print(f"Creating team with user: {current_user.id}")
    
    # Check if tournament can accept more teams
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
    db_team = crud.team.delete_team(db, team_id=team_id)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Update tournament team count after deletion
    crud.tournament.update_team_count(db, db_team.tournament_id)
    
    return db_team

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

@router.put("/{team_id}", response_model=schemas.Team)
def update_team(team_id: int, team_update: schemas.TeamUpdate, db: Session = Depends(deps.get_db)):
    db_team = crud.team.update_team(db, team_id=team_id, team_update=team_update)
    if db_team is None:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_team