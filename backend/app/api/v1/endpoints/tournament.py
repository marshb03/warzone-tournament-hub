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
from app.models.user import User
from app.models.leaderboard import LeaderboardEntry
from app.utils.bracket_generator import generate_bracket

router = APIRouter()

@router.post("/", response_model=schemas.Tournament)
def create_tournament(
    tournament: schemas.TournamentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return crud.tournament.create_tournament(db=db, tournament=tournament, creator_id=current_user.id)

@router.get("/{tournament_id}", response_model=schemas.Tournament)
def read_tournament(tournament_id: int, db: Session = Depends(deps.get_db)):
    db_tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return db_tournament

@router.get("/", response_model=List[schemas.Tournament])
def read_tournaments(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    tournaments = crud.tournament.get_tournaments(db, skip=skip, limit=limit)
    return tournaments

@router.put("/{tournament_id}", response_model=schemas.Tournament)
def update_tournament(tournament_id: int, tournament_update: schemas.TournamentUpdate, db: Session = Depends(deps.get_db), current_user: schemas.User = Depends(deps.get_current_active_user)):
    db_tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if db_tournament.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.tournament.update_tournament(db=db, tournament_id=tournament_id, tournament_update=tournament_update)

@router.delete("/{tournament_id}", response_model=schemas.Tournament)
def delete_tournament(tournament_id: int, db: Session = Depends(deps.get_db), current_user: schemas.User = Depends(deps.get_current_active_user)):
    db_tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if db_tournament.creator_id != current_user.id:
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
    
    if tournament.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if tournament.status != TournamentStatus.PENDING:
        raise HTTPException(status_code=400, detail="Tournament has already started or is completed")
    
    teams = crud.team.get_teams_by_tournament(db, tournament_id=tournament_id)
    if len(teams) < 2:
        raise HTTPException(status_code=400, detail="At least 2 teams are required to start a tournament")
    
    # Generate bracket
    generate_bracket(tournament_id, teams, db)
    
    # Update tournament status
    tournament.status = TournamentStatus.ONGOING
    db.commit()
    db.refresh(tournament)
    
    # Refresh the tournament object to get updated matches
    tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    
    return tournament

@router.post("/{tournament_id}/reset", response_model=schemas.Tournament)
def reset_tournament(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Delete all matches
    db.query(Match).filter(Match.tournament_id == tournament_id).delete()
    
    # Reset tournament status
    tournament.status = TournamentStatus.PENDING
    
    # Reset leaderboard entries
    db.query(LeaderboardEntry).filter(LeaderboardEntry.tournament_id == tournament_id).delete()
    
    db.commit()
    db.refresh(tournament)
    
    return tournament

@router.post("/{tournament_id}/end", response_model=schemas.Tournament)
def end_tournament(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    tournament = crud.tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if tournament.status != TournamentStatus.ONGOING:
        raise HTTPException(status_code=400, detail="Tournament is not ongoing")
    
    # Set tournament status to completed
    tournament.status = TournamentStatus.COMPLETED
    tournament.end_date = datetime.utcnow()
    db.commit()
    db.refresh(tournament)
    
    return tournament

'''
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.tournament import Tournament, TournamentCreate
from app import crud, models, schemas
from app.api import deps
from app.utils.bracket_generator import generate_bracket, update_bracket

router = APIRouter()

@router.post("/", response_model=schemas.Tournament)
def create_tournament(
    tournament: schemas.TournamentCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    return crud.crud_tournament.create_tournament(db=db, tournament=tournament, user_id=current_user.id)

@router.get("/{tournament_id}", response_model=schemas.Tournament)
def read_tournament(tournament_id: int, db: Session = Depends(deps.get_db)):
    db_tournament = crud.crud_tournament.get_tournament(db, tournament_id=tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return db_tournament

@router.get("/", response_model=List[schemas.Tournament])
def read_tournaments(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    tournaments = crud.crud_tournament.get_tournaments(db, skip=skip, limit=limit)
    return tournaments

@router.put("/{tournament_id}", response_model=schemas.Tournament)
def update_tournament(
    tournament_id: int,
    tournament: schemas.TournamentCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    db_tournament = crud.crud_tournament.get_tournament(db, tournament_id=tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if db_tournament.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.crud_tournament.update_tournament(db=db, tournament_id=tournament_id, tournament_data=tournament.dict())

@router.delete("/{tournament_id}", response_model=schemas.Tournament)
def delete_tournament(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    db_tournament = crud.crud_tournament.get_tournament(db, tournament_id=tournament_id)
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if db_tournament.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.crud_tournament.delete_tournament(db=db, tournament_id=tournament_id)

@router.post("/{tournament_id}/start", response_model=schemas.Tournament)
def start_tournament(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    tournament = crud.crud_tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    teams = crud.crud_team.get_teams(db, tournament_id=tournament_id)
    if len(teams) < 2:
        raise HTTPException(status_code=400, detail="At least 2 teams are required to start a tournament")
    
    # Generate bracket
    generate_bracket(tournament_id, teams, db)
    
    # Update tournament status (you may need to add a 'status' field to your Tournament model)
    tournament.status = "ONGOING"
    db.commit()
    
    return tournament

@router.put("/{tournament_id}/matches/{match_id}", response_model=schemas.Match)
def update_match_result(
    tournament_id: int,
    match_id: int,
    winner_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    tournament = crud.crud_tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    match = crud.crud_match.get_match(db, match_id=match_id)
    if not match or match.tournament_id != tournament_id:
        raise HTTPException(status_code=404, detail="Match not found in this tournament")
    
    # Update the match result and progress the tournament
    updated_match = update_bracket(match_id, winner_id, db)
    
    # Update the leaderboard
    winner_entry = schemas.LeaderboardEntryCreate(
        tournament_id=tournament_id,
        team_id=winner_id,
        wins=1,
        losses=0,
        points=3  # You can adjust the point system as needed
    )
    crud.crud_leaderboard.create_or_update_leaderboard_entry(db, winner_entry)

    loser_id = match.teams[0].id if match.teams[0].id != winner_id else match.teams[1].id
    loser_entry = schemas.LeaderboardEntryCreate(
        tournament_id=tournament_id,
        team_id=loser_id,
        wins=0,
        losses=1,
        points=0
    )
    crud.crud_leaderboard.create_or_update_leaderboard_entry(db, loser_entry)
    
    return updated_match

@router.get("/{tournament_id}/bracket", response_model=List[schemas.Match])
def get_tournament_bracket(
    tournament_id: int,
    db: Session = Depends(deps.get_db)
):
    tournament = crud.crud_tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    matches = crud.crud_match.get_matches(db, tournament_id=tournament_id)
    return matches

@router.post("/{tournament_id}/reset", response_model=schemas.Tournament)
def reset_tournament(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    tournament = crud.crud_tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Delete all matches
    crud.crud_match.delete_tournament_matches(db, tournament_id=tournament_id)
    
    # Reset tournament status
    tournament.status = "PENDING"
    db.commit()
    
    return tournament

@router.post("/{tournament_id}/cancel", response_model=schemas.Tournament)
def cancel_tournament(
    tournament_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    tournament = crud.crud_tournament.get_tournament(db, tournament_id=tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Delete all matches
    crud.crud_match.delete_tournament_matches(db, tournament_id=tournament_id)
    
    # Set tournament status to cancelled
    tournament.status = "CANCELLED"
    db.commit()
    
    return tournament
'''