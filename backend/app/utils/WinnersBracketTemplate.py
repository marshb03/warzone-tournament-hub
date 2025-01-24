# app/utils/WinnersBracketTemplate.py

from typing import Tuple, Optional, List, Dict, Union
import re

# Import all early rounds templates
from .winners_early_rounds_templates.early_rounds_4_8 import (
    EARLY_ROUNDS as EARLY_ROUNDS_4_8,
    get_matches_for_size as get_early_matches_4_8
)
from .winners_early_rounds_templates.early_rounds_9_12 import (
    EARLY_ROUNDS as EARLY_ROUNDS_9_12,
    get_matches_for_size as get_early_matches_9_12
)
from .winners_early_rounds_templates.early_rounds_13_16 import (
    EARLY_ROUNDS as EARLY_ROUNDS_13_16,
    get_matches_for_size as get_early_matches_13_16
)
from .winners_early_rounds_templates.early_rounds_17_20 import (
    EARLY_ROUNDS as EARLY_ROUNDS_17_20,
    get_matches_for_size as get_early_matches_17_20
)
from .winners_early_rounds_templates.early_rounds_21_24 import (
    EARLY_ROUNDS as EARLY_ROUNDS_21_24,
    get_matches_for_size as get_early_matches_21_24
)
from .winners_early_rounds_templates.early_rounds_25_28 import (
    EARLY_ROUNDS as EARLY_ROUNDS_25_28,
    get_matches_for_size as get_early_matches_25_28
)
from .winners_early_rounds_templates.early_rounds_29_32 import (
    EARLY_ROUNDS as EARLY_ROUNDS_29_32,
    get_matches_for_size as get_early_matches_29_32
)

# Import all later rounds templates
from .winners_later_rounds_templates.later_rounds_5_8 import (
    LATER_ROUNDS as LATER_ROUNDS_5_8,
    get_later_rounds_template as get_later_template_5_8
)
from .winners_later_rounds_templates.later_rounds_9_16 import (
    LATER_ROUNDS as LATER_ROUNDS_9_16,
    get_later_rounds_template as get_later_template_9_16
)
from .winners_later_rounds_templates.later_rounds_17_32 import (
    LATER_ROUNDS as LATER_ROUNDS_17_32,
    get_later_rounds_template as get_later_template_17_32
)

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

def parse_match_id(match_id: str) -> Tuple[str, int, int]:
    """
    Parse a match ID into its components.
    
    Args:
        match_id: String in format 'R{round}M{match}' (e.g., 'R1M1')
        
    Returns:
        Tuple of (bracket, round_number, match_number)
        
    Example:
        'R1M1' -> ('W', 1, 1)
    """
    match = re.match(r'R(\d+)M(\d+)', match_id)
    if not match:
        raise ValueError(f"Invalid match ID format: {match_id}")
    return ('W', int(match.group(1)), int(match.group(2)))

def get_team_source_details(team_source: Dict) -> Dict:
    """
    Get standardized details about a team's source.
    
    Args:
        team_source: Team source dictionary from template
        
    Returns:
        Dict with source information
    """
    if "seed" in team_source:
        return {
            "type": "seed",
            "seed": team_source["seed"]
        }
    else:
        return {
            "type": "match",
            "from": team_source["from"],
            "round": team_source["round"],
            "match": team_source["match"]
        }

def get_later_rounds_template(tournament_size: int) -> dict:
    """Get the later rounds template for a given tournament size."""
    if 5 <= tournament_size <= 8:
        return get_later_template_5_8()
    elif 9 <= tournament_size <= 16:
        return get_later_template_9_16()
    elif 17 <= tournament_size <= 32:
        return get_later_template_17_32()
    else:
        raise ValueError(f"No later rounds template available for {tournament_size} teams")

def get_early_rounds_template(tournament_size: int) -> dict:
    """Get the early rounds template for a given tournament size."""
    if 4 <= tournament_size <= 8:
        return get_early_matches_4_8(tournament_size)
    elif 9 <= tournament_size <= 12:
        return get_early_matches_9_12(tournament_size)
    elif 13 <= tournament_size <= 16:
        return get_early_matches_13_16(tournament_size)
    elif 17 <= tournament_size <= 20:
        return get_early_matches_17_20(tournament_size)
    elif 21 <= tournament_size <= 24:
        return get_early_matches_21_24(tournament_size)
    elif 25 <= tournament_size <= 28:
        return get_early_matches_25_28(tournament_size)
    elif 29 <= tournament_size <= 32:
        return get_early_matches_29_32(tournament_size)
    else:
        raise ValueError(f"No template exists for {tournament_size} teams")

def get_template_for_size(tournament_size: int) -> Dict:
    """
    Get the complete template for a given tournament size.
    
    Args:
        tournament_size: Number of teams in tournament
        
    Returns:
        Dict containing both early and later rounds if applicable
    """
    # Get early rounds template
    template = get_early_rounds_template(tournament_size)
    
    # Add later rounds if tournament size > 4
    if tournament_size >= 5:
        later_template = get_later_rounds_template(tournament_size)
        template["rounds"].update(later_template["rounds"])
    
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
    _, round_num, _ = parse_match_id(match_id)
    
    if round_num not in template["rounds"]:
        return None
        
    for match in template["rounds"][round_num]:
        if match["match_id"] == match_id:
            return match
            
    return None

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

def is_seed_reference(source: Dict) -> bool:
    """Check if a team source is a direct seed reference."""
    return "seed" in source

def is_match_reference(source: Dict) -> bool:
    """Check if a team source is a match reference."""
    return "from" in source and "round" in source and "match" in source

def validate_match_id(match_id: str) -> bool:
    """Validate match ID format."""
    pattern = r'^R\d+M\d+$'
    return bool(re.match(pattern, match_id))