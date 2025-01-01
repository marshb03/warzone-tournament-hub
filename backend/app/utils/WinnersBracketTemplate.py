# app/utils/WinnersBracketTemplate.py

# Standard bracket pairings for different tournament sizes (4-32 teams)
BRACKET_TEMPLATES = {
    4: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (1, 4), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (2, 3), "next_match": "R2M1"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": ("R1M1", "R1M2"), "next_match": None}  # Finals
            ]
        }
    },
    5: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (4, 5), "next_match": "R2M1"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": (2, 3), "next_match": "R3M1"}
            ]
        }
    },
    6: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (4, 5), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (3, 6), "next_match": "R2M2"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": (2, "R1M2"), "next_match": "R3M1"}
            ]
        }
    },
    7: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (4, 5), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (2, 7), "next_match": "R2M2"},
                {"match_id": "R1M3", "seeds": (3, 6), "next_match": "R2M2"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": ("R1M2", "R1M3"), "next_match": "R3M1"}
            ]
        }
    },
    8: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (1, 8), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (4, 5), "next_match": "R2M1"},
                {"match_id": "R1M3", "seeds": (2, 7), "next_match": "R2M2"},
                {"match_id": "R1M4", "seeds": (3, 6), "next_match": "R2M2"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": ("R1M1", "R1M2"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": ("R1M3", "R1M4"), "next_match": "R3M1"}
            ]
        }
    },
    9: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (8, 9), "next_match": "R2M1"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": (4, 5), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (2, 7), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (3, 6), "next_match": "R3M2"}
            ]
        }
    },
    10: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (8, 9), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (7, 10), "next_match": "R2M3"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": (4, 5), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (2, "R1M2"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (3, 6), "next_match": "R3M2"}
            ]
        }
    },
    11: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (8, 9), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (7, 10), "next_match": "R2M3"},
                {"match_id": "R1M3", "seeds": (6, 11), "next_match": "R2M4"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": (4, 5), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (2, "R1M2"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (3, "R1M3"), "next_match": "R3M2"}
            ]
        }
    },
    12: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (8, 9), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (5, 12), "next_match": "R2M2"},
                {"match_id": "R1M3", "seeds": (7, 10), "next_match": "R2M3"},
                {"match_id": "R1M4", "seeds": (6, 11), "next_match": "R2M4"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": (4, "R1M2"), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (2, "R1M3"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (3, "R1M4"), "next_match": "R3M2"}
            ]
        }
    },
    13: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (8, 9), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (4, 13), "next_match": "R2M2"},
                {"match_id": "R1M3", "seeds": (5, 12), "next_match": "R2M2"},
                {"match_id": "R1M4", "seeds": (7, 10), "next_match": "R2M3"},
                {"match_id": "R1M5", "seeds": (6, 11), "next_match": "R2M4"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": ("R1M2", "R1M3"), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (2, "R1M4"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (3, "R1M5"), "next_match": "R3M2"}
            ]
        }
    },
    14: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (8, 9), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (4, 13), "next_match": "R2M2"},
                {"match_id": "R1M3", "seeds": (5, 12), "next_match": "R2M2"},
                {"match_id": "R1M4", "seeds": (7, 10), "next_match": "R2M3"},
                {"match_id": "R1M5", "seeds": (3, 14), "next_match": "R2M4"},
                {"match_id": "R1M6", "seeds": (6, 11), "next_match": "R2M4"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": ("R1M2", "R1M3"), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (2, "R1M4"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": ("R1M5", "R1M6"), "next_match": "R3M2"}
            ]
        }
    },
    15: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (8, 9), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (4, 13), "next_match": "R2M2"},
                {"match_id": "R1M3", "seeds": (5, 12), "next_match": "R2M2"},
                {"match_id": "R1M4", "seeds": (2, 15), "next_match": "R2M3"},
                {"match_id": "R1M5", "seeds": (7, 10), "next_match": "R2M3"},
                {"match_id": "R1M6", "seeds": (3, 14), "next_match": "R2M4"},
                {"match_id": "R1M7", "seeds": (6, 11), "next_match": "R2M4"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": ("R1M2", "R1M3"), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": ("R1M4", "R1M5"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": ("R1M6", "R1M7"), "next_match": "R3M2"}
            ]
        }
    },
    16: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (1, 16), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (8, 9), "next_match": "R2M1"},
                {"match_id": "R1M3", "seeds": (4, 13), "next_match": "R2M2"},
                {"match_id": "R1M4", "seeds": (5, 12), "next_match": "R2M2"},
                {"match_id": "R1M5", "seeds": (2, 15), "next_match": "R2M3"},
                {"match_id": "R1M6", "seeds": (7, 10), "next_match": "R2M3"},
                {"match_id": "R1M7", "seeds": (3, 14), "next_match": "R2M4"},
                {"match_id": "R1M8", "seeds": (6, 11), "next_match": "R2M4"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": ("R1M1", "R1M2"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": ("R1M3", "R1M4"), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": ("R1M5", "R1M6"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": ("R1M7", "R1M8"), "next_match": "R3M2"}
            ]
        }
    },
    17: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": (8, 9), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (4, 13), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (5, 12), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": (2, 15), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": (7, 10), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": (3, 14), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": (6, 11), "next_match": "R3M4"}
            ]
        }
    },
    18: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (15, 18), "next_match": "R2M5"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": (8, 9), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (4, 13), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (5, 12), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": (2, "R1M2"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": (7, 10), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": (3, 14), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": (6, 11), "next_match": "R3M4"}
            ]
        }
    },
    19: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (15, 18), "next_match": "R2M5"},
                {"match_id": "R1M3", "seeds": (14, 19), "next_match": "R2M7"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": (8, 9), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (4, 13), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (5, 12), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": (2, "R1M2"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": (7, 10), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": (3, "R1M3"), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": (6, 11), "next_match": "R3M4"}
            ]
        }
    },
    20: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (13, 20), "next_match": "R2M3"},
                {"match_id": "R1M3", "seeds": (15, 18), "next_match": "R2M5"},
                {"match_id": "R1M4", "seeds": (14, 19), "next_match": "R2M7"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": (8, 9), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (4, "R1M2"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (5, 12), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": (2, "R1M3"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": (7, 10), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": (3, "R1M4"), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": (6, 11), "next_match": "R3M4"}
            ]
        }
    },
    21: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (13, 20), "next_match": "R2M3"},
                {"match_id": "R1M3", "seeds": (12, 21), "next_match": "R2M4"},
                {"match_id": "R1M4", "seeds": (15, 18), "next_match": "R2M5"},
                {"match_id": "R1M5", "seeds": (14, 19), "next_match": "R2M7"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": (8, 9), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (4, "R1M2"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (5, "R1M3"), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": (2, "R1M4"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": (7, 10), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": (3, "R1M5"), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": (6, 11), "next_match": "R3M4"}
            ]
        }
    },
    22: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (13, 20), "next_match": "R2M3"},
                {"match_id": "R1M3", "seeds": (12, 21), "next_match": "R2M4"},
                {"match_id": "R1M4", "seeds": (15, 18), "next_match": "R2M5"},
                {"match_id": "R1M5", "seeds": (14, 19), "next_match": "R2M7"},
                {"match_id": "R1M6", "seeds": (11, 22), "next_match": "R2M8"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": (8, 9), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (4, "R1M2"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (5, "R1M3"), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": (2, "R1M4"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": (7, 10), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": (3, "R1M5"), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": (6, "R1M6"), "next_match": "R3M4"}
            ]
        }
    },
    23: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (13, 20), "next_match": "R2M3"},
                {"match_id": "R1M3", "seeds": (12, 21), "next_match": "R2M4"},
                {"match_id": "R1M4", "seeds": (15, 18), "next_match": "R2M5"},
                {"match_id": "R1M5", "seeds": (10, 23), "next_match": "R2M6"},
                {"match_id": "R1M6", "seeds": (14, 19), "next_match": "R2M7"},
                {"match_id": "R1M7", "seeds": (11, 22), "next_match": "R2M8"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": (8, 9), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (4, "R1M2"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (5, "R1M3"), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": (2, "R1M4"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": (7, "R1M5"), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": (3, "R1M6"), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": (6, "R1M7"), "next_match": "R3M4"}
            ]
        }
    },
    24: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (9, 24), "next_match": "R2M2"},
                {"match_id": "R1M3", "seeds": (13, 20), "next_match": "R2M3"},
                {"match_id": "R1M4", "seeds": (12, 21), "next_match": "R2M4"},
                {"match_id": "R1M5", "seeds": (15, 18), "next_match": "R2M5"},
                {"match_id": "R1M6", "seeds": (10, 23), "next_match": "R2M6"},
                {"match_id": "R1M7", "seeds": (14, 19), "next_match": "R2M7"},
                {"match_id": "R1M8", "seeds": (11, 22), "next_match": "R2M8"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": (8, "R1M2"), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (4, "R1M3"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (5, "R1M4"), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": (2, "R1M5"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": (7, "R1M6"), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": (3, "R1M7"), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": (6, "R1M8"), "next_match": "R3M4"}
            ]
        }
    },
    25: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (8, 25), "next_match": "R2M2"},
                {"match_id": "R1M3", "seeds": (9, 24), "next_match": "R2M2"},
                {"match_id": "R1M4", "seeds": (13, 20), "next_match": "R2M3"},
                {"match_id": "R1M5", "seeds": (12, 21), "next_match": "R2M4"},
                {"match_id": "R1M6", "seeds": (15, 18), "next_match": "R2M5"},
                {"match_id": "R1M7", "seeds": (10, 23), "next_match": "R2M6"},
                {"match_id": "R1M8", "seeds": (14, 19), "next_match": "R2M7"},
                {"match_id": "R1M9", "seeds": (11, 22), "next_match": "R2M8"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": ("R1M2", "R1M3"), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (4, "R1M4"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (5, "R1M5"), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": (2, "R1M6"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": (7, "R1M7"), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": (3, "R1M8"), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": (6, "R1M9"), "next_match": "R3M4"}
            ]
        }
    },
26: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (8, 25), "next_match": "R2M2"},
                {"match_id": "R1M3", "seeds": (9, 24), "next_match": "R2M2"},
                {"match_id": "R1M4", "seeds": (13, 20), "next_match": "R2M3"},
                {"match_id": "R1M5", "seeds": (12, 21), "next_match": "R2M4"},
                {"match_id": "R1M6", "seeds": (15, 18), "next_match": "R2M5"},
                {"match_id": "R1M7", "seeds": (7, 26), "next_match": "R2M6"},
                {"match_id": "R1M8", "seeds": (10, 23), "next_match": "R2M6"},
                {"match_id": "R1M9", "seeds": (14, 19), "next_match": "R2M7"},
                {"match_id": "R1M10", "seeds": (11, 22), "next_match": "R2M8"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": ("R1M2", "R1M3"), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (4, "R1M4"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (5, "R1M5"), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": (2, "R1M6"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": ("R1M7", "R1M8"), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": (3, "R1M9"), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": (6, "R1M10"), "next_match": "R3M4"}
            ]
        }
    },
    27: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (8, 25), "next_match": "R2M2"},
                {"match_id": "R1M3", "seeds": (9, 24), "next_match": "R2M2"},
                {"match_id": "R1M4", "seeds": (13, 20), "next_match": "R2M3"},
                {"match_id": "R1M5", "seeds": (12, 21), "next_match": "R2M4"},
                {"match_id": "R1M6", "seeds": (15, 18), "next_match": "R2M5"},
                {"match_id": "R1M7", "seeds": (7, 26), "next_match": "R2M6"},
                {"match_id": "R1M8", "seeds": (10, 23), "next_match": "R2M6"},
                {"match_id": "R1M9", "seeds": (14, 19), "next_match": "R2M7"},
                {"match_id": "R1M10", "seeds": (6, 27), "next_match": "R2M8"},
                {"match_id": "R1M11", "seeds": (11, 22), "next_match": "R2M8"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": ("R1M2", "R1M3"), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (4, "R1M4"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": (5, "R1M5"), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": (2, "R1M6"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": ("R1M7", "R1M8"), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": (3, "R1M9"), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": ("R1M10", "R1M11"), "next_match": "R3M4"}
            ]
        }
    },
    28: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (8, 25), "next_match": "R2M2"},
                {"match_id": "R1M3", "seeds": (9, 24), "next_match": "R2M2"},
                {"match_id": "R1M4", "seeds": (13, 20), "next_match": "R2M3"},
                {"match_id": "R1M5", "seeds": (5, 28), "next_match": "R2M4"},
                {"match_id": "R1M6", "seeds": (12, 21), "next_match": "R2M4"},
                {"match_id": "R1M7", "seeds": (15, 18), "next_match": "R2M5"},
                {"match_id": "R1M8", "seeds": (7, 26), "next_match": "R2M6"},
                {"match_id": "R1M9", "seeds": (10, 23), "next_match": "R2M6"},
                {"match_id": "R1M10", "seeds": (14, 19), "next_match": "R2M7"},
                {"match_id": "R1M11", "seeds": (6, 27), "next_match": "R2M8"},
                {"match_id": "R1M12", "seeds": (11, 22), "next_match": "R2M8"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": ("R1M2", "R1M3"), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": (4, "R1M4"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": ("R1M5", "R1M6"), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": (2, "R1M7"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": ("R1M8", "R1M9"), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": (3, "R1M10"), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": ("R1M11", "R1M12"), "next_match": "R3M4"}
            ]
        }
    },
    29: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (8, 25), "next_match": "R2M2"},
                {"match_id": "R1M3", "seeds": (9, 24), "next_match": "R2M2"},
                {"match_id": "R1M4", "seeds": (4, 29), "next_match": "R2M3"},
                {"match_id": "R1M5", "seeds": (13, 20), "next_match": "R2M3"},
                {"match_id": "R1M6", "seeds": (5, 28), "next_match": "R2M4"},
                {"match_id": "R1M7", "seeds": (12, 21), "next_match": "R2M4"},
                {"match_id": "R1M8", "seeds": (15, 18), "next_match": "R2M5"},
                {"match_id": "R1M9", "seeds": (7, 26), "next_match": "R2M6"},
                {"match_id": "R1M10", "seeds": (10, 23), "next_match": "R2M6"},
                {"match_id": "R1M11", "seeds": (14, 19), "next_match": "R2M7"},
                {"match_id": "R1M12", "seeds": (6, 27), "next_match": "R2M8"},
                {"match_id": "R1M13", "seeds": (11, 22), "next_match": "R2M8"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": ("R1M2", "R1M3"), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": ("R1M4", "R1M5"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": ("R1M6", "R1M7"), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": (2, "R1M8"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": ("R1M9", "R1M10"), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": (3, "R1M11"), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": ("R1M12", "R1M13"), "next_match": "R3M4"}
            ]
        }
    },
    30: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (8, 25), "next_match": "R2M2"},
                {"match_id": "R1M3", "seeds": (9, 24), "next_match": "R2M2"},
                {"match_id": "R1M4", "seeds": (4, 29), "next_match": "R2M3"},
                {"match_id": "R1M5", "seeds": (13, 20), "next_match": "R2M3"},
                {"match_id": "R1M6", "seeds": (5, 28), "next_match": "R2M4"},
                {"match_id": "R1M7", "seeds": (12, 21), "next_match": "R2M4"},
                {"match_id": "R1M8", "seeds": (15, 18), "next_match": "R2M5"},
                {"match_id": "R1M9", "seeds": (7, 26), "next_match": "R2M6"},
                {"match_id": "R1M10", "seeds": (10, 23), "next_match": "R2M6"},
                {"match_id": "R1M11", "seeds": (3, 30), "next_match": "R2M7"},
                {"match_id": "R1M12", "seeds": (14, 19), "next_match": "R2M7"},
                {"match_id": "R1M13", "seeds": (6, 27), "next_match": "R2M8"},
                {"match_id": "R1M14", "seeds": (11, 22), "next_match": "R2M8"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": ("R1M2", "R1M3"), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": ("R1M4", "R1M5"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": ("R1M6", "R1M7"), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": (2, "R1M8"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": ("R1M9", "R1M10"), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": ("R1M11", "R1M12"), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": ("R1M13", "R1M14"), "next_match": "R3M4"}
            ]
        }
    },
31: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (8, 25), "next_match": "R2M2"},
                {"match_id": "R1M3", "seeds": (9, 24), "next_match": "R2M2"},
                {"match_id": "R1M4", "seeds": (4, 29), "next_match": "R2M3"},
                {"match_id": "R1M5", "seeds": (13, 20), "next_match": "R2M3"},
                {"match_id": "R1M6", "seeds": (5, 28), "next_match": "R2M4"},
                {"match_id": "R1M7", "seeds": (12, 21), "next_match": "R2M4"},
                {"match_id": "R1M8", "seeds": (2, 31), "next_match": "R2M5"},
                {"match_id": "R1M9", "seeds": (15, 18), "next_match": "R2M5"},
                {"match_id": "R1M10", "seeds": (7, 26), "next_match": "R2M6"},
                {"match_id": "R1M11", "seeds": (10, 23), "next_match": "R2M6"},
                {"match_id": "R1M12", "seeds": (3, 30), "next_match": "R2M7"},
                {"match_id": "R1M13", "seeds": (14, 19), "next_match": "R2M7"},
                {"match_id": "R1M14", "seeds": (6, 27), "next_match": "R2M8"},
                {"match_id": "R1M15", "seeds": (11, 22), "next_match": "R2M8"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": (1, "R1M1"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": ("R1M2", "R1M3"), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": ("R1M4", "R1M5"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": ("R1M6", "R1M7"), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": ("R1M8", "R1M9"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": ("R1M10", "R1M11"), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": ("R1M12", "R1M13"), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": ("R1M14", "R1M15"), "next_match": "R3M4"}
            ]
        }
    },
    32: {
        "rounds": {
            1: [
                {"match_id": "R1M1", "seeds": (1, 32), "next_match": "R2M1"},
                {"match_id": "R1M2", "seeds": (16, 17), "next_match": "R2M1"},
                {"match_id": "R1M3", "seeds": (8, 25), "next_match": "R2M2"},
                {"match_id": "R1M4", "seeds": (9, 24), "next_match": "R2M2"},
                {"match_id": "R1M5", "seeds": (4, 29), "next_match": "R2M3"},
                {"match_id": "R1M6", "seeds": (13, 20), "next_match": "R2M3"},
                {"match_id": "R1M7", "seeds": (5, 28), "next_match": "R2M4"},
                {"match_id": "R1M8", "seeds": (12, 21), "next_match": "R2M4"},
                {"match_id": "R1M9", "seeds": (2, 31), "next_match": "R2M5"},
                {"match_id": "R1M10", "seeds": (15, 18), "next_match": "R2M5"},
                {"match_id": "R1M11", "seeds": (7, 26), "next_match": "R2M6"},
                {"match_id": "R1M12", "seeds": (10, 23), "next_match": "R2M6"},
                {"match_id": "R1M13", "seeds": (3, 30), "next_match": "R2M7"},
                {"match_id": "R1M14", "seeds": (14, 19), "next_match": "R2M7"},
                {"match_id": "R1M15", "seeds": (6, 27), "next_match": "R2M8"},
                {"match_id": "R1M16", "seeds": (11, 22), "next_match": "R2M8"}
            ],
            2: [
                {"match_id": "R2M1", "seeds": ("R1M1", "R1M2"), "next_match": "R3M1"},
                {"match_id": "R2M2", "seeds": ("R1M3", "R1M4"), "next_match": "R3M1"},
                {"match_id": "R2M3", "seeds": ("R1M5", "R1M6"), "next_match": "R3M2"},
                {"match_id": "R2M4", "seeds": ("R1M7", "R1M8"), "next_match": "R3M2"},
                {"match_id": "R2M5", "seeds": ("R1M9", "R1M10"), "next_match": "R3M3"},
                {"match_id": "R2M6", "seeds": ("R1M11", "R1M12"), "next_match": "R3M3"},
                {"match_id": "R2M7", "seeds": ("R1M13", "R1M14"), "next_match": "R3M4"},
                {"match_id": "R2M8", "seeds": ("R1M15", "R1M16"), "next_match": "R3M4"}
            ]
        }
    }
}

# app/utils/WinnersBracketTemplate.py

from typing import Tuple, Optional, List, Dict, Union
import re

def parse_match_id(match_id: str) -> Tuple[str, int, int]:
    """
    Convert match ID into bracket, round and match numbers.
    Handles both prefixed (e.g., 'W-R1M1') and unprefixed (e.g., 'R1M1') formats.
    
    Args:
        match_id: String in format '[W/L]-R{round}M{match}' or 'R{round}M{match}'
        
    Returns:
        Tuple of (bracket, round_number, match_number)
    """
    # Try prefixed format first
    prefixed_match = re.match(r'([WL])-R(\d+)M(\d+)', match_id)
    if prefixed_match:
        return (prefixed_match.group(1), int(prefixed_match.group(2)), int(prefixed_match.group(3)))
    
    # Try unprefixed format
    unprefixed_match = re.match(r'R(\d+)M(\d+)', match_id)
    if unprefixed_match:
        return ('W', int(unprefixed_match.group(1)), int(unprefixed_match.group(2)))
    
    raise ValueError(f"Invalid match ID format: {match_id}")

def get_match_by_id(tournament_size: int, match_id: str) -> Optional[dict]:
    """
    Get match details by its ID.
    
    Args:
        tournament_size: Number of teams in tournament
        match_id: String in format 'R{round}M{match}' (e.g., 'R1M1')
        
    Returns:
        Match dictionary if found, None otherwise
    """
    if tournament_size not in BRACKET_TEMPLATES:
        return None
        
    # Get the round number from the match ID
    _, round_num, _ = parse_match_id(match_id)  # Now properly unpacking all three values
    template = BRACKET_TEMPLATES[tournament_size]
    
    if round_num not in template["rounds"]:
        return None
        
    for match in template["rounds"][round_num]:
        if match["match_id"] == match_id:
            return match
    
    return None

def get_next_match_id(tournament_size: int, match_id: str) -> Optional[str]:
    """
    Get the next match ID for a given match.
    
    Args:
        tournament_size: Number of teams in tournament
        match_id: String in format 'R{round}M{match}' (e.g., 'R1M1')
        
    Returns:
        Next match ID if found, None otherwise
    """
    match = get_match_by_id(tournament_size, match_id)
    return match["next_match"] if match else None

def get_matches_feeding_into(tournament_size: int, target_match_id: str) -> List[str]:
    """
    Get list of match IDs that feed into a given match.
    
    Args:
        tournament_size: Number of teams in tournament
        target_match_id: String in format 'R{round}M{match}' (e.g., 'R2M1')
        
    Returns:
        List of match IDs that feed into the target match
    """
    feeding_matches = []
    target_round, _ = parse_match_id(target_match_id)
    
    if target_round <= 1 or tournament_size not in BRACKET_TEMPLATES:
        return []
        
    # Look in previous round for matches that feed into this one
    prev_round = target_round - 1
    if prev_round in BRACKET_TEMPLATES[tournament_size]["rounds"]:
        for match in BRACKET_TEMPLATES[tournament_size]["rounds"][prev_round]:
            if match["next_match"] == target_match_id:
                feeding_matches.append(match["match_id"])
                
    return feeding_matches

def get_seeds_for_match(tournament_size: int, match_id: str) -> Tuple[Union[int, str], Union[int, str]]:
    """
    Get the seeds or winner references for a match.
    
    Args:
        tournament_size: Number of teams in tournament
        match_id: String in format 'R{round}M{match}' (e.g., 'R1M1')
        
    Returns:
        Tuple of (seed1, seed2) where each can be either an integer (direct seed)
        or string (reference to previous match winner)
        
    Raises:
        ValueError: If match not found
    """
    match = get_match_by_id(tournament_size, match_id)
    if not match:
        raise ValueError(f"Match {match_id} not found for {tournament_size} team tournament")
    return match["seeds"]

def validate_match_id(match_id: str) -> bool:
    """
    Validate that a match ID follows the correct format.
    
    Args:
        match_id: String to validate
        
    Returns:
        True if valid format, False otherwise
    """
    pattern = r'^R\d+M\d+$'
    return bool(re.match(pattern, match_id))

def is_winner_reference(seed: Union[int, str]) -> bool:
    """
    Check if a seed value is a winner reference.
    
    Args:
        seed: Either an integer (direct seed) or string (winner reference)
        
    Returns:
        True if seed is a winner reference, False if direct seed
    """
    return isinstance(seed, str) and validate_match_id(seed)

def get_round_matches(tournament_size: int, round_number: int) -> List[dict]:
    """
    Get all matches for a specific round.
    
    Args:
        tournament_size: Number of teams in tournament
        round_number: Round to get matches for
        
    Returns:
        List of match dictionaries for the specified round
    """
    if tournament_size not in BRACKET_TEMPLATES:
        return []
        
    template = BRACKET_TEMPLATES[tournament_size]
    return template["rounds"].get(round_number, [])