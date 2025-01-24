# app/utils/winners_early_rounds_templates/early_rounds_4_8.py

from typing import Dict, List

EARLY_ROUNDS = {
    4: {
        "rounds": {
            1: [
                {
                    "match_id": "R1M1",
                    "team1": {
                        "seed": 1
                    },
                    "team2": {
                        "seed": 4
                    },
                    "next_match": "R2M1"
                },
                {
                    "match_id": "R1M2",
                    "team1": {
                        "seed": 2
                    },
                    "team2": {
                        "seed": 3
                    },
                    "next_match": "R2M1"
                }
            ],
            2: [
                {
                    "match_id": "R2M1",
                    "team1": {
                        "from": "R1M1",
                        "round": 1,
                        "match": 1
                    },
                    "team2": {
                        "from": "R1M2",
                        "round": 1,
                        "match": 2
                    },
                    "next_match": None  # Finals
                }
            ]
        }
    },
    5: {
        "rounds": {
            1: [
                {
                    "match_id": "R1M1",
                    "team1": {
                        "seed": 4
                    },
                    "team2": {
                        "seed": 5
                    },
                    "next_match": "R2M1"
                }
            ],
            2: [
                {
                    "match_id": "R2M1",
                    "team1": {
                        "seed": 1  # Bye team
                    },
                    "team2": {
                        "from": "R1M1",
                        "round": 1,
                        "match": 1
                    },
                    "next_match": "R3M1"
                },
                {
                    "match_id": "R2M2",
                    "team1": {
                        "seed": 2
                    },
                    "team2": {
                        "seed": 3
                    },
                    "next_match": "R3M1"
                }
            ]
        }
    },
    6: {
        "rounds": {
            1: [
                {
                    "match_id": "R1M1",
                    "team1": {
                        "seed": 4
                    },
                    "team2": {
                        "seed": 5
                    },
                    "next_match": "R2M1"
                },
                {
                    "match_id": "R1M2",
                    "team1": {
                        "seed": 3
                    },
                    "team2": {
                        "seed": 6
                    },
                    "next_match": "R2M2"
                }
            ],
            2: [
                {
                    "match_id": "R2M1",
                    "team1": {
                        "seed": 1  # Bye team
                    },
                    "team2": {
                        "from": "R1M1",
                        "round": 1,
                        "match": 1
                    },
                    "next_match": "R3M1"
                },
                {
                    "match_id": "R2M2",
                    "team1": {
                        "seed": 2  # Bye team
                    },
                    "team2": {
                        "from": "R1M2",
                        "round": 1,
                        "match": 2
                    },
                    "next_match": "R3M1"
                }
            ]
        }
    },
    7: {
        "rounds": {
            1: [
                {
                    "match_id": "R1M1",
                    "team1": {
                        "seed": 4
                    },
                    "team2": {
                        "seed": 5
                    },
                    "next_match": "R2M1"
                },
                {
                    "match_id": "R1M2",
                    "team1": {
                        "seed": 2
                    },
                    "team2": {
                        "seed": 7
                    },
                    "next_match": "R2M2"
                },
                {
                    "match_id": "R1M3",
                    "team1": {
                        "seed": 3
                    },
                    "team2": {
                        "seed": 6
                    },
                    "next_match": "R2M2"
                }
            ],
            2: [
                {
                    "match_id": "R2M1",
                    "team1": {
                        "seed": 1  # Bye team
                    },
                    "team2": {
                        "from": "R1M1",
                        "round": 1,
                        "match": 1
                    },
                    "next_match": "R3M1"
                },
                {
                    "match_id": "R2M2",
                    "team1": {
                        "from": "R1M2",
                        "round": 1,
                        "match": 2
                    },
                    "team2": {
                        "from": "R1M3",
                        "round": 1,
                        "match": 3
                    },
                    "next_match": "R3M1"
                }
            ]
        }
    },
    8: {
        "rounds": {
            1: [
                {
                    "match_id": "R1M1",
                    "team1": {
                        "seed": 1
                    },
                    "team2": {
                        "seed": 8
                    },
                    "next_match": "R2M1"
                },
                {
                    "match_id": "R1M2",
                    "team1": {
                        "seed": 4
                    },
                    "team2": {
                        "seed": 5
                    },
                    "next_match": "R2M1"
                },
                {
                    "match_id": "R1M3",
                    "team1": {
                        "seed": 2
                    },
                    "team2": {
                        "seed": 7
                    },
                    "next_match": "R2M2"
                },
                {
                    "match_id": "R1M4",
                    "team1": {
                        "seed": 3
                    },
                    "team2": {
                        "seed": 6
                    },
                    "next_match": "R2M2"
                }
            ],
            2: [
                {
                    "match_id": "R2M1",
                    "team1": {
                        "from": "R1M1",
                        "round": 1,
                        "match": 1
                    },
                    "team2": {
                        "from": "R1M2",
                        "round": 1,
                        "match": 2
                    },
                    "next_match": "R3M1"
                },
                {
                    "match_id": "R2M2",
                    "team1": {
                        "from": "R1M3",
                        "round": 1,
                        "match": 3
                    },
                    "team2": {
                        "from": "R1M4",
                        "round": 1,
                        "match": 4
                    },
                    "next_match": "R3M1"
                }
            ]
        }
    }
}

def get_matches_for_size(tournament_size: int) -> Dict:
    """Get early round matches for a specific tournament size."""
    if tournament_size not in EARLY_ROUNDS:
        raise ValueError(f"No template for {tournament_size} teams")
    return EARLY_ROUNDS[tournament_size]

def get_round_matches(tournament_size: int, round_number: int) -> List[Dict]:
    """Get all matches for a specific round in a tournament size."""
    template = get_matches_for_size(tournament_size)
    return template["rounds"].get(round_number, [])

def validate_match_progression(tournament_size: int) -> bool:
    """Validate all matches have proper next_match assignments."""
    template = get_matches_for_size(tournament_size)
    for round_matches in template["rounds"].values():
        for match in round_matches:
            if match["next_match"] is None and not match.get("is_championship_qualifier"):
                return False
    return True