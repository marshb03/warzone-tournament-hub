# app/utils/LosersBracketTemplate.py

from typing import Tuple, Optional, List, Dict, Union
import re
from .early_rounds_templates.early_rounds_4_8 import EARLY_ROUNDS as EARLY_ROUNDS_4_8
from .early_rounds_templates.early_rounds_9_12 import EARLY_ROUNDS as EARLY_ROUNDS_9_12
from .early_rounds_templates.early_rounds_13_16 import EARLY_ROUNDS as EARLY_ROUNDS_13_16
from .early_rounds_templates.early_rounds_17_20 import EARLY_ROUNDS as EARLY_ROUNDS_17_20
from .early_rounds_templates.early_rounds_21_24 import EARLY_ROUNDS as EARLY_ROUNDS_21_24
from .early_rounds_templates.early_rounds_25_28 import EARLY_ROUNDS as EARLY_ROUNDS_25_28
from .early_rounds_templates.early_rounds_29_32 import EARLY_ROUNDS as EARLY_ROUNDS_29_32
from .later_rounds_templates.later_rounds_17_24 import LATER_ROUNDS as LATER_ROUNDS_17_24
from .later_rounds_templates.later_rounds_25_32 import LATER_ROUNDS as LATER_ROUNDS_25_32

# Combine early rounds templates
EARLY_ROUNDS = {
    **EARLY_ROUNDS_4_8,
    **EARLY_ROUNDS_9_12,
    **EARLY_ROUNDS_13_16,
    **EARLY_ROUNDS_17_20,
    **EARLY_ROUNDS_21_24,
    **EARLY_ROUNDS_25_28,
    **EARLY_ROUNDS_29_32
}

# Helper Functions
def parse_match_id(match_id: str) -> Tuple[str, int, int]:
    """
    Parse a match ID into its components.
    
    Args:
        match_id: String in format 'L-R{round}M{match}' (e.g., 'L-R1M101')
        
    Returns:
        Tuple of (bracket, round_number, match_number)
        
    Example:
        'L-R1M101' -> ('L', 1, 101)
    """
    match = re.match(r'([WL])-R(\d+)M(\d+)', match_id)
    if not match:
        raise ValueError(f"Invalid match ID format: {match_id}")
    return (match.group(1), int(match.group(2)), int(match.group(3)))

def get_template_for_size(tournament_size: int) -> Dict:
    """
    Get the complete template for a given tournament size.
    
    Args:
        tournament_size: Number of teams in tournament
        
    Returns:
        Dict containing both early and later rounds if applicable
    """
    if tournament_size not in EARLY_ROUNDS:
        raise ValueError(f"No template exists for {tournament_size} teams")
        
    template = {"rounds": EARLY_ROUNDS[tournament_size]["rounds"]}
    
    # Add later rounds if tournament size > 16
    if tournament_size >= 17:
        later_rounds = LATER_ROUNDS_25_32 if tournament_size >= 25 else LATER_ROUNDS_17_24
        template["rounds"].update(later_rounds["rounds"])
    
    return template

def get_match_details(tournament_size: int, match_id: str) -> Optional[Dict]:
    """
    Get full details for a specific match.
    
    Args:
        tournament_size: Number of teams in tournament
        match_id: Match ID to look up
        
    Returns:
        Match dictionary if found, None otherwise
    """
    template = get_template_for_size(tournament_size)
    bracket, round_num, _ = parse_match_id(match_id)
    
    if round_num not in template["rounds"]:
        return None
        
    for match in template["rounds"][round_num]:
        if match["match_id"] == match_id:
            return match
            
    return None

def get_next_match_id(tournament_size: int, match_id: str) -> Optional[str]:
    """
    Get the next match ID in progression.
    
    Args:
        tournament_size: Number of teams in tournament
        match_id: Current match ID
        
    Returns:
        Next match ID if it exists, None otherwise
    """
    match = get_match_details(tournament_size, match_id)
    return match["next_match"] if match else None

def get_round_matches(tournament_size: int, round_number: int) -> List[Dict]:
    """
    Get all matches for a specific round.
    
    Args:
        tournament_size: Number of teams in tournament
        round_number: Round number to get
        
    Returns:
        List of match dictionaries for that round
    """
    template = get_template_for_size(tournament_size)
    return template["rounds"].get(round_number, [])

def is_final_losers_match(tournament_size: int, match_id: str) -> bool:
    """
    Check if a match is the final losers bracket match.
    
    Args:
        tournament_size: Number of teams in tournament
        match_id: Match ID to check
        
    Returns:
        True if this match's winner goes to championship
    """
    match = get_match_details(tournament_size, match_id)
    return match.get("is_championship_qualifier", False) if match else False

def get_team_source_details(team_source: Dict) -> Dict[str, Union[bool, int]]:
    """
    Get standardized details about a team's source.
    
    Args:
        team_source: Team source dictionary from template
        
    Returns:
        Dict with from_winners, round, match details
    """
    return {
        "from_winners": team_source.get("from_winners", False),
        "round": team_source.get("round"),
        "match": team_source.get("match")
    }

def get_winners_entry_points(tournament_size: int) -> List[Tuple[int, int]]:
    """
    Get all points where teams enter from winners bracket.
    
    Args:
        tournament_size: Number of teams in tournament
        
    Returns:
        List of (round_number, match_number) tuples
    """
    entry_points = []
    template = get_template_for_size(tournament_size)
    
    for round_num, matches in template["rounds"].items():
        for match in matches:
            if match["team1"].get("from_winners") or match["team2"].get("from_winners"):
                entry_points.append((round_num, int(match["match_id"].split("M")[1])))
                
    return sorted(entry_points)