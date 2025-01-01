# app/utils/early_rounds_templates/early_rounds_4_8.py

from typing import Dict, List, Optional, Union

# Main template structure
EARLY_ROUNDS = {
    4: {
        "rounds": {
            1: [
                {
                    "match_id": "L-R1M101",
                    "team1": {
                        "from": "W-R1M1",
                        "round": 1,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M2",
                        "round": 1,
                        "match": 2,
                        "from_winners": True
                    },
                    "next_match": "L-R2M101"
                }
            ],
            2: [
                {
                    "match_id": "L-R2M101",
                    "team1": {
                        "from": "W-R2M1",
                        "round": 2,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R1M101",
                        "round": 1,
                        "match": 101,
                        "from_winners": False
                    },
                    "next_match": None,  # Winner goes to championship
                    "is_championship_qualifier": True
                }
            ]
        }
    },
    5: {
        "rounds": {
            1: [
                {
                    "match_id": "L-R1M101",
                    "team1": {
                        "from": "W-R2M2",
                        "round": 2,
                        "match": 2,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M1",
                        "round": 1,
                        "match": 1,
                        "from_winners": True
                    },
                    "next_match": "L-R2M101"
                }
            ],
            2: [
                {
                    "match_id": "L-R2M101",
                    "team1": {
                        "from": "W-R2M1",
                        "round": 2,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R1M101",
                        "round": 1,
                        "match": 101,
                        "from_winners": False
                    },
                    "next_match": "L-R3M101"
                }
            ],
            3: [
                {
                    "match_id": "L-R3M101",
                    "team1": {
                        "from": "W-R3M1",
                        "round": 3,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R2M101",
                        "round": 2,
                        "match": 101,
                        "from_winners": False
                    },
                    "next_match": None,  # Winner goes to championship
                    "is_championship_qualifier": True
                }
            ]
        }
    },
    6: {
        "rounds": {
            1: [
                {
                    "match_id": "L-R1M101",
                    "team1": {
                        "from": "W-R2M2",
                        "round": 2,
                        "match": 2,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M1",
                        "round": 1,
                        "match": 1,
                        "from_winners": True
                    },
                    "next_match": "L-R2M101"
                },
                {
                    "match_id": "L-R1M102",
                    "team1": {
                        "from": "W-R2M1",
                        "round": 2,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M2",
                        "round": 1,
                        "match": 2,
                        "from_winners": True
                    },
                    "next_match": "L-R2M101"
                }
            ],
            2: [
                {
                    "match_id": "L-R2M101",
                    "team1": {
                        "from": "L-R1M101",
                        "round": 1,
                        "match": 101,
                        "from_winners": False
                    },
                    "team2": {
                        "from": "L-R1M102",
                        "round": 1,
                        "match": 102,
                        "from_winners": False
                    },
                    "next_match": "L-R3M101"
                }
            ],
            3: [
                {
                    "match_id": "L-R3M101",
                    "team1": {
                        "from": "W-R3M1",
                        "round": 3,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R2M101",
                        "round": 2,
                        "match": 101,
                        "from_winners": False
                    },
                    "next_match": None,  # Winner goes to championship
                    "is_championship_qualifier": True
                }
            ]
        }
    },
    7: {
        "rounds": {
            1: [
                {
                    "match_id": "L-R1M101",
                    "team1": {
                        "from": "W-R1M2",
                        "round": 1,
                        "match": 2,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M3",
                        "round": 1,
                        "match": 3,
                        "from_winners": True
                    },
                    "next_match": "L-R2M102"
                }
            ],
            2: [
                {
                    "match_id": "L-R2M101",
                    "team1": {
                        "from": "W-R2M2",
                        "round": 2,
                        "match": 2,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M1",
                        "round": 1,
                        "match": 1,
                        "from_winners": True
                    },
                    "next_match": "L-R3M101"
                },
                {
                    "match_id": "L-R2M102",
                    "team1": {
                        "from": "W-R2M1",
                        "round": 2,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R1M101",
                        "round": 1,
                        "match": 101,
                        "from_winners": False
                    },
                    "next_match": "L-R3M101"
                }
            ],
            3: [
                {
                    "match_id": "L-R3M101",
                    "team1": {
                        "from": "L-R2M101",
                        "round": 2,
                        "match": 101,
                        "from_winners": False
                    },
                    "team2": {
                        "from": "L-R2M102",
                        "round": 2,
                        "match": 102,
                        "from_winners": False
                    },
                    "next_match": "L-R4M101"
                }
            ],
            4: [
                {
                    "match_id": "L-R4M101",
                    "team1": {
                        "from": "W-R3M1",
                        "round": 3,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R3M101",
                        "round": 3,
                        "match": 101,
                        "from_winners": False
                    },
                    "next_match": None,  # Winner goes to championship
                    "is_championship_qualifier": True
                }
            ]
        }
    },
    8: {
        "rounds": {
            1: [
                {
                    "match_id": "L-R1M101",
                    "team1": {
                        "from": "W-R1M1",
                        "round": 1,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M2",
                        "round": 1,
                        "match": 2,
                        "from_winners": True
                    },
                    "next_match": "L-R2M101"
                },
                {
                    "match_id": "L-R1M102",
                    "team1": {
                        "from": "W-R1M3",
                        "round": 1,
                        "match": 3,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M4",
                        "round": 1,
                        "match": 4,
                        "from_winners": True
                    },
                    "next_match": "L-R2M102"
                }
            ],
            2: [
                {
                    "match_id": "L-R2M101",
                    "team1": {
                        "from": "W-R2M2",
                        "round": 2,
                        "match": 2,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R1M101",
                        "round": 1,
                        "match": 101,
                        "from_winners": False
                    },
                    "next_match": "L-R3M101"
                },
                {
                    "match_id": "L-R2M102",
                    "team1": {
                        "from": "W-R2M1",
                        "round": 2,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R1M102",
                        "round": 1,
                        "match": 102,
                        "from_winners": False
                    },
                    "next_match": "L-R3M101"
                }    
            ],
            3: [
                {
                    "match_id": "L-R3M101",
                    "team1": {
                        "from": "L-R2M101",
                        "round": 2,
                        "match": 101,
                        "from_winners": False
                    },
                    "team2": {
                        "from": "L-R2M102",
                        "round": 2,
                        "match": 102,
                        "from_winners": False
                    },
                    "next_match": "L-R4M101"
                }
            ],
            4: [
                {
                    "match_id": "L-R4M101",
                    "team1": {
                        "from": "W-R3M1",
                        "round": 3,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R3M101",
                        "round": 3,
                        "match": 101,
                        "from_winners": False
                    },
                    "next_match": None,  # Winner goes to championship
                    "is_championship_qualifier": True
                }
            ]
        }
    }
}    
    
def get_matches_for_size(tournament_size: int) -> Dict:
    """Get all early round matches for a specific tournament size."""
    if tournament_size not in EARLY_ROUNDS:
        raise ValueError(f"No template for {tournament_size} teams")
    return EARLY_ROUNDS[tournament_size]

def get_round_matches(tournament_size: int, round_number: int) -> List[Dict]:
    """Get all matches for a specific round in a tournament size."""
    template = get_matches_for_size(tournament_size)
    return template["rounds"].get(round_number, [])

def validate_match_progression(tournament_size: int) -> bool:
    """Validate that all matches have proper next_match assignments."""
    template = get_matches_for_size(tournament_size)
    for round_matches in template["rounds"].values():
        for match in round_matches:
            if match["next_match"] is None and not match.get("is_championship_qualifier"):
                return False
    return True