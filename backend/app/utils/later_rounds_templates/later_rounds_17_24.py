# app/utils/later_rounds_templates/later_rounds_17_24.py

from typing import Dict, List, Optional, Union

# Main template structure
LATER_ROUNDS = {
    # This template covers rounds 3+ for all tournaments with 17-24 teams
    "rounds": {
        3: [
            {
                "match_id": "L-R3M101",
                "team1": {
                    "from": "W-R3M2",
                    "round": 3,
                    "match": 2,
                    "from_winners": True
                },
                "team2": {
                    "from": "L-R2M101",
                    "round": 2,
                    "match": 101,
                    "from_winners": False
                },
                "next_match": "L-R4M101"
            },
            {
                "match_id": "L-R3M102",
                "team1": {
                    "from": "W-R3M1",
                    "round": 3,
                    "match": 1,
                    "from_winners": True
                },
                "team2": {
                    "from": "L-R2M102",
                    "round": 2,
                    "match": 102,
                    "from_winners": False
                },
                "next_match": "L-R4M101"
            },
            {
                "match_id": "L-R3M103",
                "team1": {
                    "from": "W-R3M4",
                    "round": 3,
                    "match": 4,
                    "from_winners": True
                },
                "team2": {
                    "from": "L-R2M103",
                    "round": 2,
                    "match": 103,
                    "from_winners": False
                },
                "next_match": "L-R4M102"
            },
            {
                "match_id": "L-R3M104",
                "team1": {
                    "from": "W-R3M3",
                    "round": 3,
                    "match": 3,
                    "from_winners": True
                },
                "team2": {
                    "from": "L-R2M104",
                    "round": 2,
                    "match": 104,
                    "from_winners": False
                },
                "next_match": "L-R4M102"
            }
        ],
        4: [
            {
                "match_id": "L-R4M101",
                "team1": {
                    "from": "L-R3M101",  
                    "round": 3,
                    "match": 101,
                    "from_winners": False
                },
                "team2": {
                    "from": "L-R3M102",
                    "round": 3,
                    "match": 102,
                    "from_winners": False
                },
                "next_match": "L-R5M101"
            },
            {
                "match_id": "L-R4M102",
                "team1": {
                    "from": "L-R3M103",  
                    "round": 3,
                    "match": 103,
                    "from_winners": False
                },
                "team2": {
                    "from": "L-R3M104",
                    "round": 3,
                    "match": 104,
                    "from_winners": False
                },
                "next_match": "L-R5M102"
            }
        ],
        5: [
            {
                "match_id": "L-R5M101",
                "team1": {
                    "from": "W-R4M2",
                    "round": 4,
                    "match": 2,
                    "from_winners": True
                },
                "team2": {
                    "from": "L-R4M101",
                    "round": 4,
                    "match": 101,
                    "from_winners": False
                },
                "next_match": "L-R6M101"
            },
            {
                "match_id": "L-R5M102",
                "team1": {
                    "from": "W-R4M1",
                    "round": 4,
                    "match": 1,
                    "from_winners": True
                },
                "team2": {
                    "from": "L-R4M102",
                    "round": 4,
                    "match": 102,
                    "from_winners": False
                },
                "next_match": "L-R6M101"
            }
        ],
        6: [
            {
                "match_id": "L-R6M101",
                "team1": {
                    "from": "L-R5M101",  
                    "round": 5,
                    "match": 101,
                    "from_winners": False
                },
                "team2": {
                    "from": "L-R5M102",
                    "round": 5,
                    "match": 102,
                    "from_winners": False
                },
                "next_match": "L-R7M101"
            }
        ],
        7: [
            {
                "match_id": "L-R7M101",
                "team1": {
                    "from": "W-R5M1", 
                    "round": 5,
                    "match": 1,
                    "from_winners": True
                },
                "team2": {
                    "from": "L-R6M101",
                    "round": 6,
                    "match": 101,
                    "from_winners": False
                },
                "next_match": None,  # Winner advances to championship
                "is_championship_qualifier": True
            }
        ]
    }
}
    
def get_round_matches(round_number: int) -> List[Dict]:
    """Get all matches for a specific round."""
    if round_number < 3:
        raise ValueError("Later rounds template only handles rounds 3 and above")
    return LATER_ROUNDS["rounds"].get(round_number, [])

def get_winners_entry_matches(round_number: int) -> List[Dict]:
    """Get matches that receive teams from winners bracket in a specific round."""
    matches = []
    for match in get_round_matches(round_number):
        if match["team1"].get("from_winners") or match["team2"].get("from_winners"):
            matches.append(match)
    return matches

def find_match_by_id(match_id: str) -> Optional[Dict]:
    """Find a specific match in the later rounds."""
    for round_matches in LATER_ROUNDS["rounds"].values():
        for match in round_matches:
            if match["match_id"] == match_id:
                return match
    return None

def is_final_round_match(match_id: str) -> bool:
    """Check if a match is in the final round of losers bracket."""
    match = find_match_by_id(match_id)
    if match:
        return match.get("is_championship_qualifier", False)
    return False