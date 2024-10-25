# app/models/associations.py
from sqlalchemy import Table, Column, Integer, ForeignKey
from app.models.base import Base

team_player = Table('team_player', Base.metadata,
    Column('team_id', Integer, ForeignKey('teams.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)