# app/utils/winners_early_rounds_templates/early_rounds_9_12.py

from typing import Dict, List

EARLY_ROUNDS = {
    9: {
        "rounds": {
            1: [
                {
                    "match_id": "R1M1",
                    "team1": {
                        "seed": 8
                    },
                    "team2": {
                        "seed": 9
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
                        "seed": 4
                    },
                    "team2": {
                        "seed": 5
                    },
                    "next_match": "R3M1"
                },
                {
                    "match_id": "R2M3",
                    "team1": {
                        "seed": 2
                    },
                    "team2": {
                        "seed": 7
                    },
                    "next_match": "R3M2"
                },
                {
                    "match_id": "R2M4",
                    "team1": {
                        "seed": 3
                    },
                    "team2": {
                        "seed": 6
                    },
                    "next_match": "R3M2"
                }
            ]
        }
    },
    10: {
        "rounds": {
            1: [
                {
                    "match_id": "R1M1",
                    "team1": {
                        "seed": 8
                    },
                    "team2": {
                        "seed": 9
                    },
                    "next_match": "R2M1"
                },
                {
                    "match_id": "R1M2",
                    "team1": {
                        "seed": 7
                    },
                    "team2": {
                        "seed": 10
                    },
                    "next_match": "R2M3"
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
                        "seed": 4
                    },
                    "team2": {
                        "seed": 5
                    },
                    "next_match": "R3M1"
                },
                {
                    "match_id": "R2M3",
                    "team1": {
                        "seed": 2  # Bye team
                    },
                    "team2": {
                        "from": "R1M2",
                        "round": 1,
                        "match": 2
                    },
                    "next_match": "R3M2"
                },
                {
                    "match_id": "R2M4",
                    "team1": {
                        "seed": 3
                    },
                    "team2": {
                        "seed": 6
                    },
                    "next_match": "R3M2"
                }
            ]
        }
    },
    11: {
        "rounds": {
            1: [
                {
                    "match_id": "R1M1",
                    "team1": {
                        "seed": 8
                    },
                    "team2": {
                        "seed": 9
                    },
                    "next_match": "R2M1"
                },
                {
                    "match_id": "R1M2",
                    "team1": {
                        "seed": 7
                    },
                    "team2": {
                        "seed": 10
                    },
                    "next_match": "R2M3"
                },
                {
                    "match_id": "R1M3",
                    "team1": {
                        "seed": 6
                    },
                    "team2": {
                        "seed": 11
                    },
                    "next_match": "R2M4"
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
                        "seed": 4
                    },
                    "team2": {
                        "seed": 5
                    },
                    "next_match": "R3M1"
                },
                {
                    "match_id": "R2M3",
                    "team1": {
                        "seed": 2  # Bye team
                    },
                    "team2": {
                        "from": "R1M2",
                        "round": 1,
                        "match": 2
                    },
                    "next_match": "R3M2"
                },
                {
                    "match_id": "R2M4",
                    "team1": {
                        "seed": 3  # Bye team
                    },
                    "team2": {
                        "from": "R1M3",
                        "round": 1,
                        "match": 3
                    },
                    "next_match": "R3M2"
                }
            ]
        }
    },
    12: {
        "rounds": {
            1: [
                {
                    "match_id": "R1M1",
                    "team1": {
                        "seed": 8
                    },
                    "team2": {
                        "seed": 9
                    },
                    "next_match": "R2M1"
                },
                {
                    "match_id": "R1M2",
                    "team1": {
                        "seed": 5
                    },
                    "team2": {
                        "seed": 12
                    },
                    "next_match": "R2M2"
                },
                {
                    "match_id": "R1M3",
                    "team1": {
                        "seed": 7
                    },
                    "team2": {
                        "seed": 10
                    },
                    "next_match": "R2M3"
                },
                {
                    "match_id": "R1M4",
                    "team1": {
                        "seed": 6
                    },
                    "team2": {
                        "seed": 11
                    },
                    "next_match": "R2M4"
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
                        "seed": 4  # Bye team
                    },
                    "team2": {
                        "from": "R1M2",
                        "round": 1,
                        "match": 2
                    },
                    "next_match": "R3M1"
                },
                {
                    "match_id": "R2M3",
                    "team1": {
                        "seed": 2  # Bye team
                    },
                    "team2": {
                        "from": "R1M3",
                        "round": 1,
                        "match": 3
                    },
                    "next_match": "R3M2"
                },
                {
                    "match_id": "R2M4",
                    "team1": {
                        "seed": 3  # Bye team
                    },
                    "team2": {
                        "from": "R1M4",
                        "round": 1,
                        "match": 4
                    },
                    "next_match": "R3M2"
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