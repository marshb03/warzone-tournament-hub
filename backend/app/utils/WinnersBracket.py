# app/utils/WinnersBracket.py
from typing import List, Dict, Optional, Union
from sqlalchemy.orm import Session
from app.models.match import Match
from app.models.team import Team
from app.models.tournament import Tournament, TournamentFormat
from app.models.losers_match import LosersMatch
from .WinnersBracketTemplate import (
    get_round_matches,
    get_next_match_id,
    parse_match_id,
    get_template_for_size,
    get_team_source_details,
    is_seed_reference,
    is_match_reference
)
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

    def _get_team_by_source(self, source: Dict) -> Optional[int]:
        """
        Get team ID based on source information from template.
        
        Args:
            source: Source dictionary containing either seed or match reference
            
        Returns:
            Team ID if found, None otherwise
        """
        if is_seed_reference(source):
            # Direct seed reference
            seed = source["seed"]
            for team in self.teams:
                if team.seed == seed:
                    return team.id
            return None
        
        elif is_match_reference(source):
            # Winner from previous match
            match_id = source["from"]
            db_match_id = self.template_to_db_map.get(match_id)
            if db_match_id:
                match = self.db.query(Match).filter(Match.id == db_match_id).first()
                return match.winner_id if match and match.winner_id else None
        
        return None

    def _create_match(self, round_num: int, match_num: int, template_id: str,
                     team1_source: Dict, team2_source: Dict) -> Match:
        """
        Create a new match in the database.
        
        Args:
            round_num: Round number
            match_num: Match number within the round
            template_id: Template match ID (e.g., "R1M1")
            team1_source: Source info for first team
            team2_source: Source info for second team
        """
        team1_id = self._get_team_by_source(team1_source)
        team2_id = self._get_team_by_source(team2_source)
        
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

    def _set_match_progression(self) -> None:
        """Set up next_match_id connections after all matches are created."""
        template = get_template_for_size(self.num_teams)
        
        for round_num in template["rounds"]:
            for match_template in template["rounds"][round_num]:
                current_match_id = match_template["match_id"]
                next_match_id = match_template.get("next_match")
                
                if next_match_id:
                    current_db_id = self.template_to_db_map.get(current_match_id)
                    next_db_id = self.template_to_db_map.get(next_match_id)
                    
                    if current_db_id and next_db_id:
                        match = self.db.query(Match).filter(Match.id == current_db_id).first()
                        if match:
                            match.next_match_id = next_db_id
                        
        self.db.flush()

    def generate_bracket(self) -> Dict[int, List[Match]]:
        """Generate the complete winners bracket using templates."""
        template = get_template_for_size(self.num_teams)
        
        # Create all rounds using templates
        for current_round in template["rounds"].keys():
            round_matches = []
            for match_template in template["rounds"][current_round]:
                match_id = match_template["match_id"]
                _, _, match_num = parse_match_id(match_id)
                
                match = self._create_match(
                    round_num=current_round,
                    match_num=match_num,
                    template_id=match_id,
                    team1_source=match_template["team1"],
                    team2_source=match_template["team2"]
                )
                round_matches.append(match)
            
            self.matches[current_round] = round_matches

        # Set up match progression
        self._set_match_progression()

        self.db.commit()
        return self.matches
    
    @staticmethod
    def update_match(match_id: int, winner_id: int, db: Session) -> Match:
        """
        Update a winners bracket match with its winner and handle progression.
        Also handles dropping losing teams into the losers bracket.
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
            from .LosersBracketTemplate import get_template_for_size as get_losers_template_for_size
            
            # Get losers bracket mappings
            losers_config = tournament.bracket_config.get('losers', {})
            losers_template_to_db = losers_config.get('template_to_db_map', {})
            
            # Get source match info from template ID
            _, round_num, match_num = parse_match_id(template_id)
            
            # Get losers bracket template
            losers_template = get_losers_template_for_size(len(tournament.teams))
            
            # Look through losers matches to find where this loser belongs
            for round_matches in losers_template["rounds"].values():
                for losers_match in round_matches:
                    # Check both team slots for a match expecting this loser
                    if (losers_match["team1"].get("from_winners") and 
                        losers_match["team1"].get("round") == round_num and
                        losers_match["team1"].get("match") == match_num):
                        db_match_id = losers_template_to_db.get(losers_match["match_id"])
                        if db_match_id:
                            losers_match_db = db.query(LosersMatch).filter(
                                LosersMatch.id == db_match_id
                            ).first()
                            if losers_match_db:
                                losers_match_db.team1_id = match.loser_id
                                db.add(losers_match_db)
                    elif (losers_match["team2"].get("from_winners") and 
                          losers_match["team2"].get("round") == round_num and
                          losers_match["team2"].get("match") == match_num):
                        db_match_id = losers_template_to_db.get(losers_match["match_id"])
                        if db_match_id:
                            losers_match_db = db.query(LosersMatch).filter(
                                LosersMatch.id == db_match_id
                            ).first()
                            if losers_match_db:
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
                # Get template details for next match
                next_template_id = db_to_template.get(str(next_match.id))
                template = get_template_for_size(len(tournament.teams))
                
                # Find the template match
                _, next_round, next_match_num = parse_match_id(next_template_id)
                next_match_template = None
                for match_template in template["rounds"].get(next_round, []):
                    if match_template["match_id"] == next_template_id:
                        next_match_template = match_template
                        break
                
                if next_match_template:
                    # Check which team slot this winner should fill
                    team1_source = next_match_template["team1"]
                    team2_source = next_match_template["team2"]

                    # Check team1 slot
                    if "from" in team1_source and \
                    team1_source["from"] == template_id:
                        next_match.team1_id = winner_id
                    # Check team2 slot
                    elif "from" in team2_source and \
                        team2_source["from"] == template_id:
                        next_match.team2_id = winner_id
                elif match.next_match_id:
                    next_match = db.query(Match).filter(Match.id == match.next_match_id).first()
                    if next_match:
                        # Get template details for next match
                        next_template_id = db_to_template.get(str(next_match.id))
                        template = get_template_for_size(len(tournament.teams))
                        
                        # Find the template match
                        _, next_round, next_match_num = parse_match_id(next_template_id)
                        next_match_template = None
                        for match_template in template["rounds"].get(next_round, []):
                            if match_template["match_id"] == next_template_id:
                                next_match_template = match_template
                                break
                        
                        if next_match_template:
                            # Check which team slot this winner should fill
                            if next_match_template["team1"]["from"] == template_id:
                                next_match.team1_id = winner_id
                            elif next_match_template["team2"]["from"] == template_id:
                                next_match.team2_id = winner_id
        
        db.commit()
        db.refresh(match)
        return match