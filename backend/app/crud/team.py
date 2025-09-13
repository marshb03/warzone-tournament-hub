# app/crud/team.py - Fixed create_team function with proper parameter handling
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.team import Team
from app.schemas.team import TeamCreate, TeamUpdate

def get_next_seed(db: Session, tournament_id: int) -> int:
    """Get the next available seed number for a tournament."""
    max_seed = db.query(func.max(Team.seed))\
        .filter(Team.tournament_id == tournament_id)\
        .scalar()
    return 1 if max_seed is None else max_seed + 1

def create_team(db: Session, team: TeamCreate):
    """Create a new team with automatically assigned seed number - FIXED"""
    # Handle both TeamCreate objects and dictionaries
    if isinstance(team, dict):
        team_data = team
    else:
        team_data = team.dict()
    
    next_seed = get_next_seed(db, team_data["tournament_id"])
    
    db_team = Team(
        **team_data,
        seed=next_seed
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

def delete_team(db: Session, team_id: int):
    """Delete a team and reorder remaining seeds."""
    team = db.query(Team).filter(Team.id == team_id).first()
    if team:
        # Get all teams in the same tournament with higher seeds
        higher_seeds = db.query(Team)\
            .filter(Team.tournament_id == team.tournament_id)\
            .filter(Team.seed > team.seed)\
            .order_by(Team.seed)\
            .all()
        
        # Decrease their seed numbers by 1
        for higher_seed_team in higher_seeds:
            higher_seed_team.seed -= 1
        
        db.delete(team)
        db.commit()
    return team

def get_team(db: Session, team_id: int):
    return db.query(Team).filter(Team.id == team_id).first()

def get_teams_by_tournament(db: Session, tournament_id: int):
    return db.query(Team)\
        .filter(Team.tournament_id == tournament_id)\
        .order_by(Team.seed)\
        .all()

def update_team(db: Session, team_id: int, team_update: TeamUpdate):
    """
    Update team details while preserving seed number.
    Note: This doesn't allow changing the seed directly.
    """
    db_team = db.query(Team).filter(Team.id == team_id).first()
    if db_team is None:
        return None
    
    update_data = team_update.dict(exclude_unset=True)
    # Don't allow updating the seed through normal updates
    if 'seed' in update_data:
        del update_data['seed']
    
    for key, value in update_data.items():
        setattr(db_team, key, value)
    
    db.commit()
    db.refresh(db_team)
    return db_team

def rebalance_seeds(db: Session, tournament_id: int):
    """
    Rebalance all seeds in a tournament to ensure they are sequential.
    Useful after deletions or if seeds somehow get out of order.
    """
    teams = db.query(Team)\
        .filter(Team.tournament_id == tournament_id)\
        .order_by(Team.seed)\
        .all()
    
    for new_seed, team in enumerate(teams, 1):
        team.seed = new_seed
    
    db.commit()