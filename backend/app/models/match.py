# app/models/match.py
from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, backref
from app.models.base import Base

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    round = Column(Integer)
    match_number = Column(Integer)
    team1_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    team2_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    winner_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    loser_id = Column(Integer, ForeignKey("teams.id"), nullable=True)  # Add this
    next_match_id = Column(Integer, ForeignKey("matches.id"), nullable=True)
    
    # Add relationship for loser
    tournament = relationship("Tournament", back_populates="matches")
    team1 = relationship("Team", foreign_keys=[team1_id], back_populates="matches_as_team1")
    team2 = relationship("Team", foreign_keys=[team2_id], back_populates="matches_as_team2")
    winner = relationship("Team", foreign_keys=[winner_id], back_populates="matches_won")
    loser = relationship("Team", foreign_keys=[loser_id], backref="matches_lost")  # Add this
    next_match = relationship("Match", remote_side=[id], backref=backref("previous_matches", uselist=True))

    # Ensure match_number is unique per round per tournament
    __table_args__ = (
        UniqueConstraint('tournament_id', 'round', 'match_number', 
                        name='unique_match_number_per_round'),
    )

    def __repr__(self):
        return f"<Match(tournament={self.tournament_id}, round={self.round}, match_number={self.match_number})>"