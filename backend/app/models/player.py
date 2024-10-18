from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

# Association table for the many-to-many relationship between Team and Player
team_players = Table('team_players', Base.metadata,
    Column('team_id', Integer, ForeignKey('teams.id'), primary_key=True),
    Column('player_id', Integer, ForeignKey('players.id'), primary_key=True)
)

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    # Relationship to Team
    teams = relationship("Team", secondary=team_players, back_populates="players")