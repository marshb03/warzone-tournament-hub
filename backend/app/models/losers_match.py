# app/models/losers_match.py
from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship, backref
from app.models.base import Base

class LosersMatch(Base):
    __tablename__ = "losers_matches"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    round = Column(Integer)  
    match_number = Column(Integer)  
    team1_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    team2_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    winner_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    next_match_id = Column(Integer, ForeignKey("losers_matches.id"), nullable=True)
    dropped_from_match_id = Column(Integer, ForeignKey("matches.id"), nullable=True)
    
    # Source tracking fields
    team1_from_winners = Column(Boolean, default=True)
    team1_winners_round = Column(Integer, nullable=True)
    team1_winners_match_number = Column(Integer, nullable=True)
    team2_from_winners = Column(Boolean, default=True)
    team2_winners_round = Column(Integer, nullable=True)
    team2_winners_match_number = Column(Integer, nullable=True)
    
    # Relationships
    tournament = relationship("Tournament", back_populates="losers_matches")
    team1 = relationship(
        "Team",
        foreign_keys=[team1_id],
        primaryjoin="Team.id == LosersMatch.team1_id",
        backref=backref("losers_matches_as_team1", uselist=True)
    )
    team2 = relationship(
        "Team",
        foreign_keys=[team2_id],
        primaryjoin="Team.id == LosersMatch.team2_id",
        backref=backref("losers_matches_as_team2", uselist=True)
    )
    winner = relationship("Team", foreign_keys=[winner_id], backref="losers_matches_won")
    dropped_from_match = relationship("Match", foreign_keys=[dropped_from_match_id], backref="teams_dropped")

    # Fix the self-referential relationship
    next_match = relationship(
        "LosersMatch",
        foreign_keys=[next_match_id],
        remote_side=[id],
        backref=backref(
            "previous_matches",
            foreign_keys=[next_match_id]
        )
    )

    __table_args__ = (
        UniqueConstraint('tournament_id', 'round', 'match_number', 
                        name='unique_losers_match_number_per_round'),
    )

    def __repr__(self):
        return f"<LosersMatch(tournament={self.tournament_id}, round={self.round}, match_number={self.match_number})>"