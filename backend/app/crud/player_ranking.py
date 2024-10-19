# app/crud/player_ranking.py
from sqlalchemy.orm import Session
from app.models.player_ranking import PlayerRanking
from app.schemas.player_ranking import PlayerRankingCreate, PlayerRankingUpdate

def get_player_ranking(db: Session, ranking_id: int):
    return db.query(PlayerRanking).filter(PlayerRanking.id == ranking_id).first()

def get_player_rankings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(PlayerRanking).order_by(PlayerRanking.rank).offset(skip).limit(limit).all()

def create_player_ranking(db: Session, ranking: PlayerRankingCreate):
    db_ranking = PlayerRanking(**ranking.model_dump())
    db.add(db_ranking)
    db.commit()
    db.refresh(db_ranking)
    return db_ranking

def update_player_ranking(db: Session, ranking_id: int, ranking: PlayerRankingUpdate):
    db_ranking = get_player_ranking(db, ranking_id)
    if db_ranking:
        update_data = ranking.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_ranking, key, value)
        db.commit()
        db.refresh(db_ranking)
    return db_ranking

def delete_player_ranking(db: Session, ranking_id: int):
    db_ranking = get_player_ranking(db, ranking_id)
    if db_ranking:
        db.delete(db_ranking)
        db.commit()
    return db_ranking