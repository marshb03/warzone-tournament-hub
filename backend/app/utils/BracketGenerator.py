# app/utils/BracketGenerator.py
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.team import Team
from app.models.match import Match
from app.models.tournament import Tournament, TournamentFormat, TournamentStatus
from .WinnersBracket import WinnersBracket
from .LosersBracket import LosersBracket
from .ChampionshipMatches import ChampionshipMatches
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class BracketGenerator:
    def __init__(self, tournament_id: int, teams: List[Team], db: Session):
        """
        Initialize the bracket generator.
        
        Args:
            tournament_id: ID of the tournament
            teams: List of Team objects
            db: Database session
        """
        self.tournament_id = tournament_id
        self.teams = teams
        self.db = db
        self.tournament = self.db.query(Tournament).filter(Tournament.id == tournament_id).first()
        
        if not self.tournament:
            raise ValueError(f"Tournament with id {tournament_id} not found")
            
        self._validate_tournament()
    
    def _validate_tournament(self) -> None:
        """Validate tournament setup before generating brackets."""
        if not self.teams:
            raise ValueError("No teams provided for bracket generation")
            
        if self.tournament.status != TournamentStatus.PENDING:
            raise ValueError("Cannot generate bracket for tournament that is not in PENDING status")
            
        # Ensure we have the minimum required teams
        if len(self.teams) < 4:
            raise ValueError("Tournament must have at least 4 teams")
            
        # Ensure we don't exceed maximum teams
        if len(self.teams) > 32:
            raise ValueError("Tournament cannot have more than 32 teams")
    
    def generate_bracket(self) -> Dict[str, Dict[int, List[Match]]]:
        """
        Generate the complete tournament bracket based on tournament format.
        Returns a dictionary containing all generated matches organized by bracket type and round.
        """
        try:
            logger.debug("Starting bracket generation")
            bracket_data = {}
            template_mappings = {}
            
            # Generate winners bracket
            logger.debug("Generating winners bracket")
            winners_bracket = WinnersBracket(self.tournament_id, self.teams, self.db)
            bracket_data['winners'] = winners_bracket.generate_bracket()
            template_mappings['winners'] = {
                'template_to_db_map': winners_bracket.template_to_db_map,
                'db_to_template_map': winners_bracket.db_to_template_map
            }
            logger.debug("Winners bracket generated successfully")
            
            # For double elimination tournaments
            if self.tournament.format == TournamentFormat.DOUBLE_ELIMINATION:
                logger.debug("Tournament is double elimination, generating losers bracket")
                # Generate losers bracket
                try:
                    losers_bracket = LosersBracket(self.tournament_id, self.teams, self.db)
                    bracket_data['losers'] = losers_bracket.generate_bracket()
                    template_mappings['losers'] = {
                        'template_to_db_map': losers_bracket.template_to_db_map,
                        'db_to_template_map': losers_bracket.db_to_template_map
                    }
                    logger.debug("Losers bracket generated successfully")
                except Exception as e:
                    logger.error(f"Error generating losers bracket: {str(e)}")
                    raise
                
                logger.debug("Generating championship matches")
                try:
                    # Generate championship matches
                    championship = ChampionshipMatches(self.tournament_id, self.db)
                    first_match, reset_match = championship.generate_matches()
                    logger.debug(f"Championship matches generated: first_match={first_match.id if first_match else None}, reset_match={reset_match.id if reset_match else None}")
                    bracket_data['championship'] = {
                        98: [first_match] if first_match else [],
                        99: [reset_match] if reset_match else []
                    }
                except Exception as e:
                    logger.error(f"Error generating championship matches: {str(e)}")
                    raise
            
            logger.debug("Storing template mappings in tournament config")
            # Store template mappings in tournament config
            self.tournament.bracket_config = template_mappings
            
            # Update tournament status
            self.tournament.status = TournamentStatus.ONGOING
            self.db.commit()
            logger.debug("Bracket generation completed successfully")
            
            return bracket_data
            
        except Exception as e:
            logger.error(f"Error during bracket generation: {str(e)}")
            logger.error(f"Error type: {type(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise
    
    @staticmethod
    def update_bracket(match_id: int, winner_id: int, db: Session) -> Match:
        """
        Update a match with its winner and handle progression logic.
        This method handles matches in any bracket (winners, losers, or championship).
        
        Args:
            match_id: ID of the match being updated
            winner_id: ID of the winning team
            db: Database session
            
        Returns:
            Updated Match object
        """
        # Try winners bracket first
        match = db.query(Match).filter(Match.id == match_id).first()
        if match:
            # If this is a championship match
            if match.round in [98, 99]:
                return ChampionshipMatches.update_match(match_id, winner_id, db)
            # Regular winners bracket match
            return WinnersBracket.update_match(match_id, winner_id, db)
        
        # Try losers bracket if not found in winners
        return LosersBracket.update_match(match_id, winner_id, db)

def generate_bracket(tournament_id: int, teams: List[Team], db: Session) -> Dict[str, Dict[int, List[Match]]]:
    """
    Convenience function to generate a tournament bracket.
    This is the main entry point for bracket generation.
    """
    generator = BracketGenerator(tournament_id, teams, db)
    return generator.generate_bracket()

def update_bracket(match_id: int, winner_id: int, db: Session) -> Match:
    """
    Convenience function to update a match with its winner.
    """
    return BracketGenerator.update_bracket(match_id, winner_id, db)