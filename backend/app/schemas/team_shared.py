# app/schemas/team_shared.py
from pydantic import BaseModel

class TeamInMatch(BaseModel):
    id: int
    name: str
    seed: int

    class Config:
        from_attributes = True