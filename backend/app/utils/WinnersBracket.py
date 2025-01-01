# app/utils/WinnersBracket.py
from typing import List, Dict, Optional, Union
from sqlalchemy.orm import Session
from app.models.match import Match
from app.models.team import Team
from .WinnersBracketTemplate import (
    get_round_matches,
    get_match_by_id,
    get_next_match_id,
    is_winner_reference,
    parse_match_id,
    get_matches_feeding_into
)
from .LosersBracketTemplate import get_template_for_size
import math
from app.models.tournament import Tournament, TournamentFormat
from app.models.losers_match import LosersMatch
import re

class WinnersBracket:
    def __init__(self, tournament_id: int, teams: List[Team], db: Session):
        """Initialize the winners bracket generator."""
        self.tournament_id = tournament_id
        self.teams = sorted(teams, key=lambda x: x.seed)
        self.db = db
        self.matches: Dict[int, List[Match]] = {}
        self.num_teams = len(teams)
        self.template_to_db_map: Dict[str, int] = {}  # Maps template match IDs to database IDs
        self.db_to_template_map: Dict[int, str] = {}  # Maps database IDs to template match IDs
        self.generated_matches: Dict[int, List[dict]] = {}  # Stores generated match templates
        self._validate()

    def _validate(self) -> None:
        """Validate tournament parameters."""
        if self.num_teams < 4:
            raise ValueError("Tournament must have at least 4 teams")
        if self.num_teams > 32:
            raise ValueError("Tournament cannot have more than 32 teams")
            
        seeds = sorted(team.seed for team in self.teams)
        if seeds != list(range(1, self.num_teams + 1)):
            raise ValueError("Team seeds must be sequential from 1 to number of teams")
            
        if len(set(seeds)) != len(seeds):
            raise ValueError("Team seeds must be unique")

    def _calculate_num_rounds(self) -> int:
        """Calculate total number of rounds needed for the bracket."""
        return math.ceil(math.log2(self.num_teams))

    def _get_team_id_by_seed(self, seed: Union[int, str]) -> Optional[int]:
        """
        Get team ID from seed number or winner reference.
        
        Args:
            seed: Either an integer (direct seed) or string (match ID reference)
            
        Returns:
            Team ID if found, None otherwise
        """
        if isinstance(seed, int):
            # Direct seed reference
            for team in self.teams:
                if team.seed == seed:
                    return team.id
            return None
        elif is_winner_reference(seed):
            # Winner reference (e.g., "R1M1")
            db_match_id = self.template_to_db_map.get(seed)
            if db_match_id:
                match = self.db.query(Match).filter(Match.id == db_match_id).first()
                return match.winner_id if match and match.winner_id else None
        return None

    def _create_match(self, round_num: int, match_num: int, template_id: str,
                     team1_seed: Optional[Union[int, str]], team2_seed: Optional[Union[int, str]]) -> Match:
        """
        Create a new match in the database.
        
        Args:
            round_num: Round number
            match_num: Match number within the round
            template_id: Template match ID (e.g., "R1M1")
            team1_seed: First team's seed or winner reference
            team2_seed: Second team's seed or winner reference
        """
        team1_id = self._get_team_id_by_seed(team1_seed) if team1_seed else None
        team2_id = self._get_team_id_by_seed(team2_seed) if team2_seed else None
        
        match = Match(
            tournament_id=self.tournament_id,
            round=round_num,
            match_number=match_num,
            team1_id=team1_id,
            team2_id=team2_id,
            has_bye=team2_id is None and team1_id is not None
        )
        self.db.add(match)
        self.db.flush()  # Get the database ID
        
        # Store the mappings
        self.template_to_db_map[template_id] = match.id
        self.db_to_template_map[match.id] = template_id
        
        return match

    def _create_matches_for_round(self, round_num: int) -> List[Match]:
        """Create matches for a specific round using template matches."""
        round_matches = []
        template_matches = get_round_matches(self.num_teams, round_num)
        
        for match_num, template_match in enumerate(template_matches, 1):
            match_id = template_match["match_id"]
            seed1, seed2 = template_match["seeds"]
            
            match = self._create_match(
                round_num=round_num,
                match_num=match_num,
                template_id=match_id,
                team1_seed=seed1,
                team2_seed=seed2
            )
            round_matches.append(match)
        
        return round_matches

    def _create_later_round_match(self, round_num: int, match_num: int) -> Match:
        """
        Create a match for rounds after round 2.
        Automatically generates appropriate template IDs and next match info.
        """
        template_id = f"R{round_num}M{match_num}"
        next_match_template = None
        
        # Calculate next match info
        if round_num < self._calculate_num_rounds():
            next_round = round_num + 1
            next_match_num = (match_num + 1) // 2  # Integer division to get parent match
            next_match_template = f"R{next_round}M{next_match_num}"

        match = self._create_match(
            round_num=round_num,
            match_num=match_num,
            template_id=template_id,
            team1_seed=None,
            team2_seed=None
        )

        # Store the next match template ID for progression setup
        if next_match_template:
            match_info = {
                "match_id": template_id,
                "next_match": next_match_template,
                "seeds": (None, None)
            }
            template_round = self.generated_matches.setdefault(round_num, [])
            template_round.append(match_info)

        return match

    def _set_match_progression(self) -> None:
        """Set up next_match_id connections after all matches are created."""
        # Handle all rounds
        for round_num in self.matches:
            for match in self.matches[round_num]:
                template_id = self.db_to_template_map[match.id]
                template_match = None

                # Try to get from predefined templates first
                if round_num <= 2:
                    template_match = get_match_by_id(self.num_teams, template_id)
                # If not found and we have generated template, use that
                elif round_num in self.generated_matches:
                    template_match = next(
                        (m for m in self.generated_matches[round_num] 
                         if m["match_id"] == template_id),
                        None
                    )

                if template_match and template_match["next_match"]:
                    next_match_id = self.template_to_db_map.get(template_match["next_match"])
                    if next_match_id:
                        match.next_match_id = next_match_id
                        
        self.db.flush()  # Ensure all next_match_id values are saved

    def generate_bracket(self) -> Dict[int, List[Match]]:
        """Generate the complete winners bracket."""
        num_rounds = self._calculate_num_rounds()
        
        # Create first two rounds using templates
        for current_round in range(1, min(3, num_rounds + 1)):
            round_matches = self._create_matches_for_round(current_round)
            if round_matches:
                self.matches[current_round] = round_matches

        # Generate remaining rounds
        for current_round in range(3, num_rounds + 1):
            prev_matches = self.matches[current_round - 1]
            current_matches = []
            match_num = 1

            # Create matches for this round
            for i in range(0, len(prev_matches), 2):
                match = self._create_later_round_match(current_round, match_num)
                current_matches.append(match)
                match_num += 1

            self.matches[current_round] = current_matches

        # Set up match progression after all matches are created
        self._set_match_progression()

        self.db.commit()
        return self.matches
    
    @staticmethod
    def update_match(match_id: int, winner_id: int, db: Session) -> Match:
        """
        Update a winners bracket match with its winner and handle progression.
        Also handles dropping losing teams into the losers bracket.
        
        Args:
            match_id: ID of the match being updated
            winner_id: ID of the winning team
            db: Database session
            
        Returns:
            Updated Match object
            
        Raises:
            ValueError: If match not found, winner invalid, or template mapping missing
        """
        # Get match and validate
        match = db.query(Match).filter(Match.id == match_id).first()
        if not match:
            raise ValueError(f"Match with id {match_id} not found")
            
        # Check match hasn't already been completed
        if match.is_completed:
            raise ValueError(f"Match {match_id} has already been completed")
            
        # Validate winner is part of the match
        if winner_id not in [match.team1_id, match.team2_id]:
            raise ValueError("Winner must be one of the teams in the match")
            
        # Get tournament and template mappings
        tournament = db.query(Tournament).filter(Tournament.id == match.tournament_id).first()
        if not tournament or not tournament.bracket_config:
            raise ValueError("Tournament configuration not found")
            
        # Get winners bracket mappings
        winners_config = tournament.bracket_config.get('winners', {})
        db_to_template = winners_config.get('db_to_template_map', {})
        template_to_db = winners_config.get('template_to_db_map', {})
        
        # Get current match template ID
        template_id = db_to_template.get(str(match_id))
        if not template_id:
            raise ValueError(f"Template mapping not found for match {match_id}")
            
        # Update match with winner and loser
        match.winner_id = winner_id
        match.loser_id = match.team1_id if match.team1_id != winner_id else match.team2_id
        match.is_completed = True

        # If tournament is double elimination, handle dropping loser to losers bracket
        if tournament.format == TournamentFormat.DOUBLE_ELIMINATION:
            # Get losers bracket mappings
            losers_config = tournament.bracket_config.get('losers', {})
            losers_template_to_db = losers_config.get('template_to_db_map', {})
            
            # Get source match info from unprefixed template ID
            # The template_id will be like "R1M1" but we need round and match numbers
            template_matches = template_id.split('R')[1].split('M')  # Split "R1M1" into ["1", "1"]
            round_num = int(template_matches[0])
            match_num = int(template_matches[1])
            
            # Get losers bracket template
            template = get_template_for_size(len(tournament.teams))
            
            # Look through losers matches to find where this loser belongs
            for round_matches in template["rounds"].values():
                for losers_match in round_matches:
                    # Check both team slots for a match expecting this loser
                    for team_source in [losers_match["team1"], losers_match["team2"]]:
                        if (team_source.get("from_winners") and 
                            team_source.get("round") == round_num and
                            team_source.get("match") == match_num):
                            # Found the right match, get database ID
                            db_match_id = losers_template_to_db.get(losers_match["match_id"])
                            if db_match_id:
                                losers_match_db = db.query(LosersMatch).filter(
                                    LosersMatch.id == db_match_id
                                ).first()
                                if losers_match_db:
                                    # Place loser in appropriate slot based on template
                                    if team_source == losers_match["team1"]:
                                        losers_match_db.team1_id = match.loser_id
                                    else:
                                        losers_match_db.team2_id = match.loser_id
                                    
                                    db.add(losers_match_db)
        
        # If this is the final winners bracket match, winner goes to championship
        if match.next_match_id is None:
            # Get championship match
            championship_match = db.query(Match).filter(
                Match.tournament_id == match.tournament_id,
                Match.round == 98,
                Match.match_number == 201
            ).first()
            
            if championship_match:
                # Place winners bracket champion in team1 slot
                championship_match.team1_id = winner_id
        
        # Handle normal progression if there's a next match
        elif match.next_match_id:
            next_match = db.query(Match).filter(Match.id == match.next_match_id).first()
            if next_match:
                # Get next match template data
                next_template_id = db_to_template.get(str(next_match.id))
                if not next_template_id:
                    raise ValueError("Template mapping not found for next match")
                
                # Place winner in appropriate slot
                if not next_match.team1_id:
                    next_match.team1_id = winner_id
                else:
                    next_match.team2_id = winner_id
        
        db.commit()
        db.refresh(match)
        return match