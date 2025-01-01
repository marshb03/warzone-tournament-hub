# app/utils/early_rounds_templates/early_rounds_13_16.py

from typing import Dict, List, Optional, Union

EARLY_ROUNDS = {
    13: {
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
                        "from": "W-R2M4",
                        "round": 2,
                        "match": 4,
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
                        "from": "W-R2M3",
                        "round": 2,
                        "match": 3,
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
                    "match_id": "L-R2M103",
                    "team1": {
                        "from": "W-R2M2",
                        "round": 2,
                        "match": 2,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M4",
                        "round": 1,
                        "match": 4,
                        "from_winners": True
                    },
                    "next_match": "L-R3M102"
                },
                {
                    "match_id": "L-R2M104",
                    "team1": {
                        "from": "W-R2M1",
                        "round": 2,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M5",
                        "round": 1,
                        "match": 5,
                        "from_winners": True
                    },
                    "next_match": "L-R3M102"
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
                },
                {
                    "match_id": "L-R3M102",
                    "team1": {
                        "from": "L-R2M103",
                        "round": 2,
                        "match": 103,
                        "from_winners": False
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
                    "next_match": "L-R5M101"
                },
                {
                    "match_id": "L-R4M102",
                    "team1": {
                        "from": "W-R3M2",
                        "round": 3,
                        "match": 2,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R3M102",
                        "round": 3,
                        "match": 102,
                        "from_winners": False
                    },
                    "next_match": "L-R5M101"
                }
            ],
            5: [
                {
                    "match_id": "L-R5M101",
                    "team1": {
                        "from": "L-R4M101",
                        "round": 4,
                        "match": 101,
                        "from_winners": False
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
                        "from": "W-R4M1",
                        "round": 4,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R5M101",
                        "round": 5,
                        "match": 101,
                        "from_winners": False
                    },
                    "next_match": None,  # Winner goes to championship
                    "is_championship_qualifier": True
                } 
            ]
        }
    },
    14: {
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
                },
                {
                    "match_id": "L-R1M102",
                    "team1": {
                        "from": "W-R1M5",
                        "round": 1,
                        "match": 5,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M6",
                        "round": 1,
                        "match": 6,
                        "from_winners": True
                    },
                    "next_match": "L-R2M104"
                }
            ],
            2: [
                {
                    "match_id": "L-R2M101",
                    "team1": {
                        "from": "W-R2M4",
                        "round": 2,
                        "match": 4,
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
                        "from": "W-R2M3",
                        "round": 2,
                        "match": 3,
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
                    "match_id": "L-R2M103",
                    "team1": {
                        "from": "W-R2M2",
                        "round": 2,
                        "match": 2,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M4",
                        "round": 1,
                        "match": 4,
                        "from_winners": True
                    },
                    "next_match": "L-R3M102"
                },
                {
                    "match_id": "L-R2M104",
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
                    "next_match": "L-R3M102"
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
                },
                {
                    "match_id": "L-R3M102",
                    "team1": {
                        "from": "L-R2M103",
                        "round": 2,
                        "match": 103,
                        "from_winners": False
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
                    "next_match": "L-R5M101"
                },
                {
                    "match_id": "L-R4M102",
                    "team1": {
                        "from": "W-R3M2",
                        "round": 3,
                        "match": 2,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R3M102",
                        "round": 3,
                        "match": 102,
                        "from_winners": False
                    },
                    "next_match": "L-R5M101"
                }
            ],
            5: [
                {
                    "match_id": "L-R5M101",
                    "team1": {
                        "from": "L-R4M101",
                        "round": 4,
                        "match": 101,
                        "from_winners": False
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
                        "from": "W-R4M1",
                        "round": 4,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R5M101",
                        "round": 5,
                        "match": 101,
                        "from_winners": False
                    },
                    "next_match": None,  # Winner goes to championship
                    "is_championship_qualifier": True
                } 
            ]
        }
    },
    15: {
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
                },
                {
                    "match_id": "L-R1M102",
                    "team1": {
                        "from": "W-R1M4",
                        "round": 1,
                        "match": 4,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M5",
                        "round": 1,
                        "match": 5,
                        "from_winners": True
                    },
                    "next_match": "L-R2M103"
                },
                {
                    "match_id": "L-R1M103",
                    "team1": {
                        "from": "W-R1M6",
                        "round": 1,
                        "match": 6,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M3",
                        "round": 1,
                        "match": 7,
                        "from_winners": True
                    },
                    "next_match": "L-R2M104"
                }
            ],
            2: [
                {
                    "match_id": "L-R2M101",
                    "team1": {
                        "from": "W-R2M4",
                        "round": 2,
                        "match": 4,
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
                        "from": "W-R2M3",
                        "round": 2,
                        "match": 3,
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
                    "match_id": "L-R2M103",
                    "team1": {
                        "from": "W-R2M2",
                        "round": 2,
                        "match": 2,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R1M102",
                        "round": 1,
                        "match": 102,
                        "from_winners": False
                    },
                    "next_match": "L-R3M102"
                },
                {
                    "match_id": "L-R2M104",
                    "team1": {
                        "from": "W-R2M1",
                        "round": 2,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R1M103",
                        "round": 1,
                        "match": 103,
                        "from_winners": False
                    },
                    "next_match": "L-R3M102"
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
                },
                {
                    "match_id": "L-R3M102",
                    "team1": {
                        "from": "L-R2M103",
                        "round": 2,
                        "match": 103,
                        "from_winners": False
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
                    "next_match": "L-R5M101"
                },
                {
                    "match_id": "L-R4M102",
                    "team1": {
                        "from": "W-R3M2",
                        "round": 3,
                        "match": 2,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R3M102",
                        "round": 3,
                        "match": 102,
                        "from_winners": False
                    },
                    "next_match": "L-R5M101"
                }
            ],
            5: [
                {
                    "match_id": "L-R5M101",
                    "team1": {
                        "from": "L-R4M101",
                        "round": 4,
                        "match": 101,
                        "from_winners": False
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
                        "from": "W-R4M1",
                        "round": 4,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R5M101",
                        "round": 5,
                        "match": 101,
                        "from_winners": False
                    },
                    "next_match": None,  # Winner goes to championship
                    "is_championship_qualifier": True
                } 
            ]
        }
    },
    16: {
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
                },
                {
                    "match_id": "L-R1M103",
                    "team1": {
                        "from": "W-R1M5",
                        "round": 1,
                        "match": 5,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M6",
                        "round": 1,
                        "match": 6,
                        "from_winners": True
                    },
                    "next_match": "L-R2M103"
                },
                {
                    "match_id": "L-R1M104",
                    "team1": {
                        "from": "W-R1M7",
                        "round": 1,
                        "match": 7,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "W-R1M8",
                        "round": 1,
                        "match": 8,
                        "from_winners": True
                    },
                    "next_match": "L-R2M104"
                }
            ],
            2: [
                {
                    "match_id": "L-R2M101",
                    "team1": {
                        "from": "W-R2M4",
                        "round": 2,
                        "match": 4,
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
                        "from": "W-R2M3",
                        "round": 2,
                        "match": 3,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R1M102",
                        "round": 1,
                        "match": 102,
                        "from_winners": False
                    },
                    "next_match": "L-R3M101"
                },
                {
                    "match_id": "L-R2M103",
                    "team1": {
                        "from": "W-R2M2",
                        "round": 2,
                        "match": 2,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R1M103",
                        "round": 1,
                        "match": 103,
                        "from_winners": False
                    },
                    "next_match": "L-R3M102"
                },
                {
                    "match_id": "L-R2M104",
                    "team1": {
                        "from": "W-R2M1",
                        "round": 2,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R1M104",
                        "round": 1,
                        "match": 104,
                        "from_winners": True
                    },
                    "next_match": "L-R3M102"
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
                },
                {
                    "match_id": "L-R3M102",
                    "team1": {
                        "from": "L-R2M103",
                        "round": 2,
                        "match": 103,
                        "from_winners": False
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
                    "next_match": "L-R5M101"
                },
                {
                    "match_id": "L-R4M102",
                    "team1": {
                        "from": "W-R3M2",
                        "round": 3,
                        "match": 2,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R3M102",
                        "round": 3,
                        "match": 102,
                        "from_winners": False
                    },
                    "next_match": "L-R5M101"
                }
            ],
            5: [
                {
                    "match_id": "L-R5M101",
                    "team1": {
                        "from": "L-R4M101",
                        "round": 4,
                        "match": 101,
                        "from_winners": False
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
                        "from": "W-R4M1",
                        "round": 4,
                        "match": 1,
                        "from_winners": True
                    },
                    "team2": {
                        "from": "L-R5M101",
                        "round": 5,
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