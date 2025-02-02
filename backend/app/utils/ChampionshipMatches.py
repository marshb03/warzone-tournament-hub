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

    # app/utils/ChampionshipMatches.py
    @staticmethod
    def update_match(match_id: int, winner_id: int, db: Session) -> Optional[Match]:
        """
        Update a championship match with its winner.
        """
        try:
            match = db.query(Match).filter(Match.id == match_id).first()
            if not match:
                raise ValueError(f"Match {match_id} not found")

            print(f"Updating championship match {match_id}")
            print(f"Current match state - team1: {match.team1_id}, team2: {match.team2_id}, winner: {winner_id}")

            # Validate winner is part of match
            if winner_id not in [match.team1_id, match.team2_id]:
                raise ValueError(f"Winner {winner_id} must be one of the teams in the match ({match.team1_id}, {match.team2_id})")

            # If this is first championship match (round 98)
            if match.round == 98:
                if winner_id == match.team2_id:  # Losers bracket team won
                    print("Losers bracket team won match 98, setting up reset match")
                    reset_match = db.query(Match).filter(
                        Match.tournament_id == match.tournament_id,
                        Match.round == 99
                    ).first()
                    
                    if reset_match:
                        print("Found reset match, updating teams")
                        reset_match.team1_id = match.team1_id
                        reset_match.team2_id = winner_id
                    else:
                        print("Reset match not found, creating new one")
                        reset_match = Match(
                            tournament_id=match.tournament_id,
                            round=99,
                            team1_id=match.team1_id,
                            team2_id=winner_id,
                            match_number=201
                        )
                        db.add(reset_match)
                else:
                    print("Winners bracket team won match 98, removing reset match")
                    try:
                        # First, remove the next_match_id reference
                        match.next_match_id = None
                        db.flush()  # Ensure the reference is removed before deleting
                        
                        # Now try to delete the reset match
                        deleted = db.query(Match).filter(
                            Match.tournament_id == match.tournament_id,
                            Match.round == 99
                        ).delete(synchronize_session=False)
                        print(f"Deleted {deleted} reset match(es)")
                    except Exception as delete_error:
                        print(f"Error handling reset match: {str(delete_error)}")
                        # Continue even if delete fails - not critical

            # Update match data
            match.winner_id = winner_id
            match.loser_id = match.team1_id if match.team1_id != winner_id else match.team2_id
            match.is_completed = True
            
            print(f"Updated match state - winner: {match.winner_id}, loser: {match.loser_id}")

            # Commit all changes
            try:
                db.commit()
                db.refresh(match)
                print("Successfully committed championship match update")
                return match
            except Exception as commit_error:
                print(f"Error committing changes: {str(commit_error)}")
                db.rollback()
                raise commit_error

        except Exception as e:
            print(f"Error in championship match update: {str(e)}")
            db.rollback()
            raise ValueError(f"Failed to update championship match: {str(e)}")