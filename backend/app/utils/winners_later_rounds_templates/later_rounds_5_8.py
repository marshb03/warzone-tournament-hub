# app/utils/winners_later_rounds_templates/later_rounds_5_8.py

from typing import Dict, List

LATER_ROUNDS = {
    "rounds": {
        3: [
            {
                "match_id": "R3M1",
                "team1": {
                    "from": "R2M1",
                    "round": 2,
                    "match": 1
                },
                "team2": {
                    "from": "R2M2",
                    "round": 2,
                    "match": 2
                },
                "next_match": None  # Finals
            }
        ]
    }
}

def get_later_rounds_template() -> dict:
    """Get the later rounds template for 5-8 team tournaments."""
    return LATER_ROUNDS

def get_later_round_matches(round_number: int) -> List[dict]:
    """Get all matches for a specific later round."""
    return LATER_ROUNDS["rounds"].get(round_number, [])

def is_later_round(round_number: int) -> bool:
    """Check if a round number is considered a later round."""
    return round_number in LATER_ROUNDS["rounds"]