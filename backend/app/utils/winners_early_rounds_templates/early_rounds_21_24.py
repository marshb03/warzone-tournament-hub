# app/utils/winners_early_rounds_templates/early_rounds_21_24.py

from typing import Dict, List

EARLY_ROUNDS = {
    21: {
        "rounds": {
            1: [
                {
                    "match_id": "R1M1",
                    "team1": {
                        "seed": 16
                    },
                    "team2": {
                        "seed": 17
                    },
                    "next_match": "R2M1"
                },
                {
                    "match_id": "R1M2",
                    "team1": {
                        "seed": 13
                    },
                    "team2": {
                        "seed": 20
                    },
                    "next_match": "R2M3"
                },
                {
                    "match_id": "R1M3",
                    "team1": {
                        "seed": 12
                    },
                    "team2": {
                        "seed": 21
                    },
                    "next_match": "R2M4"
                },
                {
                    "match_id": "R1M4",
                    "team1": {
                        "seed": 15
                    },
                    "team2": {
                        "seed": 18
                    },
                    "next_match": "R2M5"
                },
                {
                    "match_id": "R1M5",
                    "team1": {
                        "seed": 14
                    },
                    "team2": {
                        "seed": 19
                    },
                    "next_match": "R2M7"
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
                        "seed": 8
                    },
                    "team2": {
                        "seed": 9
                    },
                    "next_match": "R3M1"
                },
                {
                    "match_id": "R2M3",
                    "team1": {
                        "seed": 4  # Bye team
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
                        "seed": 5  # Bye team
                    },
                    "team2": {
                        "from": "R1M3",
                        "round": 1,
                        "match": 3
                    },
                    "next_match": "R3M2"
                },
                {
                    "match_id": "R2M5",
                    "team1": {
                        "seed": 2  # Bye team
                    },
                    "team2": {
                        "from": "R1M4",
                        "round": 1,
                        "match": 4
                    },
                    "next_match": "R3M3"
                },
                {
                    "match_id": "R2M6",
                    "team1": {
                        "seed": 7
                    },
                    "team2": {
                        "seed": 10
                    },
                    "next_match": "R3M3"
                },
                {
                    "match_id": "R2M7",
                    "team1": {
                        "seed": 3  # Bye team
                    },
                    "team2": {
                        "from": "R1M5",
                        "round": 1,
                        "match": 5
                    },
                    "next_match": "R3M4"
                },
                {
                    "match_id": "R2M8",
                    "team1": {
                        "seed": 6
                    },
                    "team2": {
                        "seed": 11
                    },
                    "next_match": "R3M4"
                }
            ]
        }
    },
    22: {
        "rounds": {
            1: [
                {
                    "match_id": "R1M1",
                    "team1": {
                        "seed": 16
                    },
                    "team2": {
                        "seed": 17
                    },
                    "next_match": "R2M1"
                },
                {
                    "match_id": "R1M2",
                    "team1": {
                        "seed": 13
                    },
                    "team2": {
                        "seed": 20
                    },
                    "next_match": "R2M3"
                },
                {
                    "match_id": "R1M3",
                    "team1": {
                        "seed": 12
                    },
                    "team2": {
                        "seed": 21
                    },
                    "next_match": "R2M4"
                },
                {
                    "match_id": "R1M4",
                    "team1": {
                        "seed": 15
                    },
                    "team2": {
                        "seed": 18
                    },
                    "next_match": "R2M5"
                },
                {
                    "match_id": "R1M5",
                    "team1": {
                        "seed": 14
                    },
                    "team2": {
                        "seed": 19
                    },
                    "next_match": "R2M7"
                },
                {
                    "match_id": "R1M6",
                    "team1": {
                        "seed": 11
                    },
                    "team2": {
                        "seed": 22
                    },
                    "next_match": "R2M8"
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
                        "seed": 8
                    },
                    "team2": {
                        "seed": 9
                    },
                    "next_match": "R3M1"
                },
                {
                    "match_id": "R2M3",
                    "team1": {
                        "seed": 4  # Bye team
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
                        "seed": 5  # Bye team
                    },
                    "team2": {
                        "from": "R1M3",
                        "round": 1,
                        "match": 3
                    },
                    "next_match": "R3M2"
                },
                {
                    "match_id": "R2M5",
                    "team1": {
                        "seed": 2  # Bye team
                    },
                    "team2": {
                        "from": "R1M4",
                        "round": 1,
                        "match": 4
                    },
                    "next_match": "R3M3"
                },
                {
                    "match_id": "R2M6",
                    "team1": {
                        "seed": 7
                    },
                    "team2": {
                        "seed": 10
                    },
                    "next_match": "R3M3"
                },
                {
                    "match_id": "R2M7",
                    "team1": {
                        "seed": 3  # Bye team
                    },
                    "team2": {
                        "from": "R1M5",
                        "round": 1,
                        "match": 5
                    },
                    "next_match": "R3M4"
                },
                {
                    "match_id": "R2M8",
                    "team1": {
                        "seed": 6  # Bye team
                    },
                    "team2": {
                        "from": "R1M6",
                        "round": 1,
                        "match": 6
                    },
                    "next_match": "R3M4"
                }
            ]
        }
    },
    23: {
        "rounds": {
            1: [
                {
                    "match_id": "R1M1",
                    "team1": {
                        "seed": 16
                    },
                    "team2": {
                        "seed": 17
                    },
                    "next_match": "R2M1"
                },
                {
                    "match_id": "R1M2",
                    "team1": {
                        "seed": 13
                    },
                    "team2": {
                        "seed": 20
                    },
                    "next_match": "R2M3"
                },
                {
                    "match_id": "R1M3",
                    "team1": {
                        "seed": 12
                    },
                    "team2": {
                        "seed": 21
                    },
                    "next_match": "R2M4"
                },
                {
                    "match_id": "R1M4",
                    "team1": {
                        "seed": 15
                    },
                    "team2": {
                        "seed": 18
                    },
                    "next_match": "R2M5"
                },
                {
                    "match_id": "R1M5",
                    "team1": {
                        "seed": 10
                    },
                    "team2": {
                        "seed": 23
                    },
                    "next_match": "R2M6"
                },
                {
                    "match_id": "R1M6",
                    "team1": {
                        "seed": 14
                    },
                    "team2": {
                        "seed": 19
                    },
                    "next_match": "R2M7"
                },
                {
                    "match_id": "R1M7",
                    "team1": {
                        "seed": 11
                    },
                    "team2": {
                        "seed": 22
                    },
                    "next_match": "R2M8"
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
                        "seed": 8
                    },
                    "team2": {
                        "seed": 9
                    },
                    "next_match": "R3M1"
                },
                {
                    "match_id": "R2M3",
                    "team1": {
                        "seed": 4  # Bye team
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
                        "seed": 5  # Bye team
                    },
                    "team2": {
                        "from": "R1M3",
                        "round": 1,
                        "match": 3
                    },
                    "next_match": "R3M2"
                },
                {
                    "match_id": "R2M5",
                    "team1": {
                        "seed": 2  # Bye team
                    },
                    "team2": {
                        "from": "R1M4",
                        "round": 1,
                        "match": 4
                    },
                    "next_match": "R3M3"
                },
                {
                    "match_id": "R2M6",
                    "team1": {
                        "seed": 7  # Bye team
                    },
                    "team2": {
                        "from": "R1M5",
                        "round": 1,
                        "match": 5
                    },
                    "next_match": "R3M3"
                },
                {
                    "match_id": "R2M7",
                    "team1": {
                        "seed": 3  # Bye team
                    },
                    "team2": {
                        "from": "R1M6",
                        "round": 1,
                        "match": 6
                    },
                    "next_match": "R3M4"
                },
                {
                    "match_id": "R2M8",
                    "team1": {
                        "seed": 6  # Bye team
                    },
                    "team2": {
                        "from": "R1M7",
                        "round": 1,
                        "match": 7
                    },
                    "next_match": "R3M4"
                }
            ]
        }
    },
    24: {
        "rounds": {
            1: [
                {
                    "match_id": "R1M1",
                    "team1": {
                        "seed": 16
                    },
                    "team2": {
                        "seed": 17
                    },
                    "next_match": "R2M1"
                },
                {
                    "match_id": "R1M2",
                    "team1": {
                        "seed": 9
                    },
                    "team2": {
                        "seed": 24
                    },
                    "next_match": "R2M2"
                },
                {
                    "match_id": "R1M3",
                    "team1": {
                        "seed": 13
                    },
                    "team2": {
                        "seed": 20
                    },
                    "next_match": "R2M3"
                },
                {
                    "match_id": "R1M4",
                    "team1": {
                        "seed": 12
                    },
                    "team2": {
                        "seed": 21
                    },
                    "next_match": "R2M4"
                },
                {
                    "match_id": "R1M5",
                    "team1": {
                        "seed": 15
                    },
                    "team2": {
                        "seed": 18
                    },
                    "next_match": "R2M5"
                },
                {
                    "match_id": "R1M6",
                    "team1": {
                        "seed": 10
                    },
                    "team2": {
                        "seed": 23
                    },
                    "next_match": "R2M6"
                },
                {
                    "match_id": "R1M7",
                    "team1": {
                        "seed": 14
                    },
                    "team2": {
                        "seed": 19
                    },
                    "next_match": "R2M7"
                },
                {
                    "match_id": "R1M8",
                    "team1": {
                        "seed": 11
                    },
                    "team2": {
                        "seed": 22
                    },
                    "next_match": "R2M8"
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
                        "seed": 8  # Bye team
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
                        "seed": 4  # Bye team
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
                        "seed": 5  # Bye team
                    },
                    "team2": {
                        "from": "R1M4",
                        "round": 1,
                        "match": 4
                    },
                    "next_match": "R3M2"
                },
                {
                    "match_id": "R2M5",
                    "team1": {
                        "seed": 2  # Bye team
                    },
                    "team2": {
                        "from": "R1M5",
                        "round": 1,
                        "match": 5
                    },
                    "next_match": "R3M3"
                },
                {
                    "match_id": "R2M6",
                    "team1": {
                        "seed": 7  # Bye team
                    },
                    "team2": {
                        "from": "R1M6",
                        "round": 1,
                        "match": 6
                    },
                    "next_match": "R3M3"
                },
                {
                    "match_id": "R2M7",
                    "team1": {
                        "seed": 3  # Bye team
                    },
                    "team2": {
                        "from": "R1M7",
                        "round": 1,
                        "match": 7
                    },
                    "next_match": "R3M4"
                },
                {
                    "match_id": "R2M8",
                    "team1": {
                        "seed": 6  # Bye team
                    },
                    "team2": {
                        "from": "R1M8",
                        "round": 1,
                        "match": 8
                    },
                    "next_match": "R3M4"
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