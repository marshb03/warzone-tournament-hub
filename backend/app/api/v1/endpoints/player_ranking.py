# app/api/v1/endpoints/player_ranking.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, field_validator, ValidationInfo
import smtplib
from email.mime.text import MIMEText
from app.core.config import settings
from app.ml import player_ranking_prediction
from typing import Any, List
from sqlalchemy.orm import Session
from app.schemas.player_ranking import PlayerRankingCreate, PlayerRankingUpdate, PlayerRanking
from app.crud import player_ranking as crud_player_ranking
from app.api import deps
from app.api.deps import get_current_active_superuser
from app.schemas.user import User

router = APIRouter()

class PlayerRankingForm(BaseModel):
    player_name: str
    twitter_handle: str
    previous_ranking: int = Field(ge=0)
    stream_link: str
    kd_ratio: float = Field(ge=0)
    total_kills: int = Field(ge=0)
    total_time_played: int = Field(ge=0)  # in minutes
    wins: int = Field(ge=0)
    score_per_min: float = Field(ge=0)

    @field_validator('previous_ranking', 'kd_ratio', 'total_kills', 'total_time_played', 'wins', 'score_per_min')
    @classmethod
    def no_negative_values(cls, v: Any, info: ValidationInfo) -> Any:
        if isinstance(v, (int, float)) and v < 0:
            raise ValueError(f"{info.field_name} cannot be negative")
        return v

@router.post("/submit-ranking")
async def submit_ranking(form_data: PlayerRankingForm):
    # Process form data and get prediction
    prediction = player_ranking_prediction.predict(form_data.model_dump())
    
    # Prepare email content
    email_content = f"""
    New Player Ranking Submission:
    
    Player Name: {form_data.player_name}
    Twitter Handle: {form_data.twitter_handle}
    Previous Ranking: {form_data.previous_ranking}
    Stream Link: {form_data.stream_link}
    K/D Ratio: {form_data.kd_ratio}
    Total Kills: {form_data.total_kills}
    Total Time Played: {form_data.total_time_played} minutes
    Wins: {form_data.wins}
    Score/Min: {form_data.score_per_min}
    
    Predicted Ranking: {prediction}
    """
    
    # Send email
    msg = MIMEText(email_content)
    msg['Subject'] = f"New Player Ranking Submission: {form_data.player_name}"
    msg['From'] = settings.EMAIL_FROM
    msg['To'] = ', '.join(settings.EMAIL_RECIPIENTS)
    
    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
    
    return {"message": "Ranking submitted successfully", "prediction": prediction}

@router.get("/rankings", response_model=List[PlayerRanking])
def read_player_rankings(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(deps.get_db)
):
    rankings = crud_player_ranking.get_player_rankings(db, skip=skip, limit=limit)
    return rankings

@router.get("/rankings/{ranking_id}", response_model=PlayerRanking)
def read_player_ranking(
    ranking_id: int, 
    db: Session = Depends(deps.get_db)
):
    db_ranking = crud_player_ranking.get_player_ranking(db, ranking_id=ranking_id)
    if db_ranking is None:
        raise HTTPException(status_code=404, detail="Player ranking not found")
    return db_ranking

@router.post("/rankings", response_model=PlayerRanking)
def create_player_ranking(
    ranking: PlayerRankingCreate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    return crud_player_ranking.create_player_ranking(db=db, ranking=ranking)

@router.put("/rankings/{ranking_id}", response_model=PlayerRanking)
def update_player_ranking(
    ranking_id: int, 
    ranking: PlayerRankingUpdate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    db_ranking = crud_player_ranking.update_player_ranking(db, ranking_id=ranking_id, ranking=ranking)
    if db_ranking is None:
        raise HTTPException(status_code=404, detail="Player ranking not found")
    return db_ranking

@router.delete("/rankings/{ranking_id}", response_model=PlayerRanking)
def delete_player_ranking(
    ranking_id: int, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    db_ranking = crud_player_ranking.delete_player_ranking(db, ranking_id=ranking_id)
    if db_ranking is None:
        raise HTTPException(status_code=404, detail="Player ranking not found")
    return db_ranking