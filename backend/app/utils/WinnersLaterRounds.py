# app/utils/WinnersLaterRounds.py

LATER_ROUNDS = {
    "5-8": {
        "rounds": {
            3: [
                {"match_id": "R3M1", "seeds": ("R2M1", "R2M2"), "next_match": None}  # Finals
            ]
        }
    },
    "9-16": {
        "rounds": {
            3: [
                {"match_id": "R3M1", "seeds": ("R2M1", "R2M2"), "next_match": "R4M1"},
                {"match_id": "R3M2", "seeds": ("R2M3", "R2M4"), "next_match": "R4M1"}
            ],
            4: [
                {"match_id": "R4M1", "seeds": ("R3M1", "R3M2"), "next_match": None}  # Finals
            ]
        }
    },
    "17-32": {
        "rounds": {
            3: [
                {"match_id": "R3M1", "seeds": ("R2M1", "R2M2"), "next_match": "R4M1"},
                {"match_id": "R3M2", "seeds": ("R2M3", "R2M4"), "next_match": "R4M1"},
                {"match_id": "R3M3", "seeds": ("R2M5", "R2M6"), "next_match": "R4M2"},
                {"match_id": "R3M4", "seeds": ("R2M7", "R2M8"), "next_match": "R4M2"}
            ],
            4: [
                {"match_id": "R4M1", "seeds": ("R3M1", "R3M2"), "next_match": "R5M1"},
                {"match_id": "R4M2", "seeds": ("R3M3", "R3M4"), "next_match": "R5M1"}
            ],
            5: [
                {"match_id": "R5M1", "seeds": ("R4M1", "R4M2"), "next_match": None}  # Finals
            ]
        }
    }
}

from typing import List

def get_later_rounds_template(num_teams: int) -> dict:
    """
    Get the later rounds template for a given tournament size.
    
    Args:
        num_teams: Number of teams in tournament
        
    Returns:
        Dict containing later rounds template
    """
    if 5 <= num_teams <= 8:
        return LATER_ROUNDS["5-8"]
    elif 9 <= num_teams <= 16:
        return LATER_ROUNDS["9-16"]
    elif 17 <= num_teams <= 32:
        return LATER_ROUNDS["17-32"]
    else:
        raise ValueError(f"No later rounds template available for {num_teams} teams")

def get_later_round_matches(num_teams: int, round_number: int) -> List[dict]:
    """
    Get all matches for a specific later round.
    
    Args:
        num_teams: Number of teams in tournament
        round_number: Round to get matches for
        
    Returns:
        List of match dictionaries for that round
    """
    template = get_later_rounds_template(num_teams)
    return template["rounds"].get(round_number, [])

def is_later_round(num_teams: int, round_number: int) -> bool:
    """
    Check if a round number is considered a later round for the given tournament size.
    
    Args:
        num_teams: Number of teams in tournament
        round_number: Round number to check
        
    Returns:
        True if it's a later round, False otherwise
    """
    template = get_later_rounds_template(num_teams)
    return round_number in template["rounds"]