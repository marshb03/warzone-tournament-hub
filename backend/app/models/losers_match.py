# app/models/losers_match.py
from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, backref
from app.models.base import Base

class LosersMatch(Base):
    __tablename__ = "losers_matches"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    round = Column(Integer)  # Round number (1, 2, 3, etc.)
    match_number = Column(Integer)  # Match number within round
    team1_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    team2_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    winner_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    next_match_id = Column(Integer, ForeignKey("losers_matches.id"), nullable=True)
    dropped_from_match_id = Column(Integer, ForeignKey("matches.id"), nullable=True)  # Reference to winners bracket match
    
    # Relationships
    tournament = relationship("Tournament", back_populates="losers_matches")
    team1 = relationship("Team", foreign_keys=[team1_id], backref="losers_matches_as_team1")
    team2 = relationship("Team", foreign_keys=[team2_id], backref="losers_matches_as_team2")
    winner = relationship("Team", foreign_keys=[winner_id], backref="losers_matches_won")
    next_match = relationship("LosersMatch", remote_side=[id], backref=backref("previous_matches", uselist=True))
    dropped_from_match = relationship("Match", foreign_keys=[dropped_from_match_id], backref="teams_dropped")

    # Ensure match_number is unique per round per tournament
    __table_args__ = (
        UniqueConstraint('tournament_id', 'round', 'match_number', 
                        name='unique_losers_match_number_per_round'),
    )

    def __repr__(self):
        return f"<LosersMatch(tournament={self.tournament_id}, round={self.round}, match_number={self.match_number})>"