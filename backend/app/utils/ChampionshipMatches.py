# app/utils/ChampionshipMatches.py
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.match import Match
from app.models.team import Team
from app.models.tournament import TournamentFormat

class ChampionshipMatches:
    def __init__(self, tournament_id: int, db: Session):
        """Initialize the championship matches generator."""
        self.tournament_id = tournament_id
        self.db = db

    def generate_matches(self) -> Tuple[Match, Optional[Match]]:
        """
        Generate championship matches.
        Creates both the first championship match and potential reset match.
        
        Returns:
            Tuple of (first_match, reset_match)
        """
        # Create first championship match (Round 98)
        first_match = Match(
            tournament_id=self.tournament_id,
            round=98,
            match_number=201,
            team1_id=None,  # Will be set by winners bracket champion
            team2_id=None,  # Will be set by losers bracket champion
            next_match_id=None,  # Will be set if reset match is needed
            is_completed=False
        )
        self.db.add(first_match)
        self.db.flush()

        # Create potential reset match (Round 99)
        reset_match = Match(
            tournament_id=self.tournament_id,
            round=99,
            match_number=201,
            team1_id=None,  # Will be set based on first match result
            team2_id=None,  # Will be set based on first match result
            next_match_id=None,
            is_completed=False
        )
        self.db.add(reset_match)
        self.db.flush()
        
        # Link first match to reset match
        first_match.next_match_id = reset_match.id
        
        self.db.commit()
        return first_match, reset_match

    @staticmethod
    def update_match(match_id: int, winner_id: int, db: Session) -> Optional[Match]:
        """
        Update a championship match with its winner.
        
        Args:
            match_id: ID of the match being updated
            winner_id: ID of the winning team
            db: Database session
            
        Returns:
            Updated Match object
        """
        match = db.query(Match).filter(Match.id == match_id).first()
        if not match:
            return None

        # Validate winner is part of match
        if winner_id not in [match.team1_id, match.team2_id]:
            raise ValueError("Winner must be one of the teams in the match")

        # Update winner
        match.winner_id = winner_id
        match.loser_id = match.team1_id if match.team1_id != winner_id else match.team2_id
        match.is_completed = True

        # If this is first championship match (round 98)
        if match.round == 98:
            # If losers bracket team won, set up reset match
            if winner_id == match.team2_id:  # Losers bracket team won
                reset_match = db.query(Match).filter(
                    Match.tournament_id == match.tournament_id,
                    Match.round == 99,
                    Match.match_number == 201
                ).first()
                if reset_match:
                    # Winner's bracket team goes to team1, winner of first match goes to team2
                    reset_match.team1_id = match.team1_id
                    reset_match.team2_id = winner_id
            else:
                # Winners bracket team won, tournament is over, no reset match needed
                db.query(Match).filter(
                    Match.tournament_id == match.tournament_id,
                    Match.round == 99
                ).delete()

        db.commit()
        db.refresh(match)
        return match