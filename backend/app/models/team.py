from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))

    # Relationship to Tournament
    tournament = relationship("Tournament", back_populates="teams")

    # Relationship to Player (we'll define this in the Player model)
    players = relationship("Player", secondary="team_players", back_populates="teams")