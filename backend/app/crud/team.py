# app/crud/team.py
from sqlalchemy.orm import Session
from app.models.tournament import Team
from app.schemas.team import TeamCreate, TeamUpdate

def create_team(db: Session, team: TeamCreate):
    db_team = Team(**team.dict())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

def get_team(db: Session, team_id: int):
    return db.query(Team).filter(Team.id == team_id).first()

def get_teams_by_tournament(db: Session, tournament_id: int):
    return db.query(Team).filter(Team.tournament_id == tournament_id).all()

def update_team(db: Session, team_id: int, team_update: TeamUpdate):
    db_team = get_team(db, team_id)
    if db_team:
        update_data = team_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_team, key, value)
        db.commit()
        db.refresh(db_team)
    return db_team

def delete_team(db: Session, team_id: int):
    db_team = get_team(db, team_id)
    if db_team:
        db.delete(db_team)
        db.commit()
    return db_team