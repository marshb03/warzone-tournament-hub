# app/utils/LosersBracket.py
from typing import List, Dict, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.match import Match
from app.models.losers_match import LosersMatch
from app.models.team import Team
from app.models.tournament import Tournament
from .LosersBracketTemplate import (
    get_template_for_size,
    get_match_details,
    get_round_matches,
    parse_match_id,
    is_final_losers_match
)

class LosersBracket:
    def __init__(self, tournament_id: int, teams: List[Team], db: Session):
        """Initialize the losers bracket generator."""
        self.tournament_id = tournament_id
        self.teams = sorted(teams, key=lambda x: x.seed)
        self.db = db
        self.matches: Dict[int, List[LosersMatch]] = {}
        self.num_teams = len(teams)
        self.template_to_db_map: Dict[str, int] = {}  # Maps template match IDs to database IDs
        self.db_to_template_map: Dict[int, str] = {}  # Maps database IDs to template match IDs
        self._validate()

    def _validate(self) -> None:
        """Validate tournament parameters."""
        if self.num_teams < 4:
            raise ValueError("Tournament must have at least 4 teams")
        if self.num_teams > 32:
            raise ValueError("Tournament cannot have more than 32 teams")

    def _get_team_id_by_source(self, source: Dict) -> Optional[int]:
        """
        Get team ID based on source information from template.
        
        Args:
            source: Source dictionary from template containing from_winners, round, match info
            
        Returns:
            Team ID if found, None otherwise
        """
        if source["from_winners"]:
            # Team will come from winners bracket later
            return None
        
        # For teams already in losers bracket
        if source.get("from"):
            match_id = source["from"]
            db_match_id = self.template_to_db_map.get(match_id)
            if db_match_id:
                match = self.db.query(LosersMatch).filter(LosersMatch.id == db_match_id).first()
                return match.winner_id if match and match.winner_id else None
        
        return None

    def _create_match(self, round_num: int, match_num: int, template_id: str,
                     team1_source: Dict, team2_source: Dict) -> LosersMatch:
        """
        Create a new match in the database.
        
        Args:
            round_num: Round number
            match_num: Match number within the round
            template_id: Template match ID (e.g., "L-R1M101")
            team1_source: Source info for first team
            team2_source: Source info for second team
        """
        match = LosersMatch(
            tournament_id=self.tournament_id,
            round=round_num,
            match_number=match_num,
            team1_id=self._get_team_id_by_source(team1_source),
            team2_id=self._get_team_id_by_source(team2_source),
            team1_from_winners=team1_source.get("from_winners", False),
            team1_winners_round=team1_source.get("round"),
            team1_winners_match_number=team1_source.get("match"),
            team2_from_winners=team2_source.get("from_winners", False),
            team2_winners_round=team2_source.get("round"),
            team2_winners_match_number=team2_source.get("match")
        )
        
        self.db.add(match)
        self.db.flush()  # Get the database ID
        
        # Store the mappings
        self.template_to_db_map[template_id] = match.id
        self.db_to_template_map[match.id] = template_id
        
        return match

    def _create_matches_for_round(self, round_num: int) -> List[LosersMatch]:
        """Create matches for a specific round using template matches."""
        round_matches = []
        template_matches = get_round_matches(self.num_teams, round_num)
        
        for match_template in template_matches:
            _, _, match_num = parse_match_id(match_template["match_id"])
            
            match = self._create_match(
                round_num=round_num,
                match_num=match_num,
                template_id=match_template["match_id"],
                team1_source=match_template["team1"],
                team2_source=match_template["team2"]
            )
            round_matches.append(match)
        
        return round_matches

    def _set_match_progression(self) -> None:
        """Set up next_match_id connections after all matches are created."""
        template = get_template_for_size(self.num_teams)
        
        for round_matches in template["rounds"].values():
            for match_template in round_matches:
                match_id = match_template["match_id"]
                next_match_id = match_template.get("next_match")
                
                if next_match_id:
                    current_db_id = self.template_to_db_map.get(match_id)
                    next_db_id = self.template_to_db_map.get(next_match_id)
                    
                    if current_db_id and next_db_id:
                        match = self.db.query(LosersMatch).filter(LosersMatch.id == current_db_id).first()
                        if match:
                            match.next_match_id = next_db_id
        
        self.db.flush()

    def generate_bracket(self) -> Dict[int, List[LosersMatch]]:
        """Generate the complete losers bracket."""
        template = get_template_for_size(self.num_teams)
        
        # Create matches round by round
        for round_num in template["rounds"].keys():
            round_matches = self._create_matches_for_round(round_num)
            if round_matches:
                self.matches[round_num] = round_matches

        # Set up match progression after all matches are created
        self._set_match_progression()

        self.db.commit()
        return self.matches

    @staticmethod
    def update_match(match_id: int, winner_id: int, db: Session) -> Optional[LosersMatch]:
        """
        Update a losers bracket match with its winner and handle progression.
        """
        match = db.query(LosersMatch).filter(LosersMatch.id == match_id).first()
        if not match:
            raise ValueError(f"Match with id {match_id} not found")
                
        # Get tournament and template mappings
        tournament = db.query(Tournament).filter(Tournament.id == match.tournament_id).first()
        if not tournament or not tournament.bracket_config:
            raise ValueError("Tournament configuration not found")
                
        # Get losers bracket mappings
        losers_config = tournament.bracket_config.get('losers', {})
        db_to_template = losers_config.get('db_to_template_map', {})
        template_id = db_to_template.get(str(match.id))
        
        if not template_id:
            raise ValueError(f"Template mapping not found for match {match_id}")
                
        # Validate winner is part of match
        if winner_id not in [match.team1_id, match.team2_id]:
            raise ValueError("Winner must be one of the teams in the match")
                
        # Update winner
        match.winner_id = winner_id
        
        # Get template for this tournament size
        template = get_template_for_size(len(tournament.teams))
        
        # Get max round for this tournament size
        max_round = max(template["rounds"].keys())
        
        # Check if this is the final losers match (advances to championship)
        if match.round == max_round and match.match_number == 101:
            # Get championship match
            championship_match = db.query(Match).filter(
                Match.tournament_id == match.tournament_id,
                Match.round == 98,
                Match.match_number == 201
            ).first()
            
            if not championship_match:
                raise ValueError("Championship match not found")
                
            # Update championship match with losers bracket winner
            championship_match.team2_id = winner_id
                
        # Handle normal progression if there's a next match
        elif match.next_match_id:
            next_match = db.query(LosersMatch).filter(LosersMatch.id == match.next_match_id).first()
            if next_match:
                # Get next match template info
                next_template_id = db_to_template.get(str(next_match.id))
                for round_matches in template["rounds"].values():
                    for match_template in round_matches:
                        if match_template["match_id"] == next_template_id:
                            # Check which slot this winner should go to
                            if match_template["team1"].get("from") == template_id:
                                next_match.team1_id = winner_id
                            elif match_template["team2"].get("from") == template_id:
                                next_match.team2_id = winner_id
        
        db.commit()
        db.refresh(match)
        return match