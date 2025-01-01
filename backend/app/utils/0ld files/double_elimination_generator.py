from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.tournament import Tournament
from app.models.losers_match import LosersMatch
from app.models.match import Match
from app.models.team import Team
from math import log2, ceil
from fastapi import HTTPException


def calculate_losers_bracket_structure(num_teams: int) -> Dict[int, Dict]:
    """
    Calculate losers bracket structure based on tournament size (4-32 teams).
    Returns a dictionary mapping round numbers to their structure info.
    """
    if not 4 <= num_teams <= 32:
        raise ValueError("Number of teams must be between 4 and 32")
    
    structure = {}
    
    # Round 1 matches
    if num_teams == 32:
        r1_matches = 8
    elif num_teams == 16:
        r1_matches = 4
    elif num_teams == 8:
        r1_matches = 2
    elif num_teams == 4:
        r1_matches = 1
    elif num_teams >= 25:  # 25-31 teams
        r1_matches = 8
    elif num_teams >= 17:  # 17-24 teams
        r1_matches = num_teams - 16
    elif num_teams >= 13:  # 13-16 teams
        r1_matches = 4
    elif num_teams >= 9:   # 9-12 teams
        r1_matches = num_teams - 8
    else:                  # 5-8 teams
        r1_matches = num_teams - 4

    structure[1] = {
        'num_matches': r1_matches,
        'start_match_num': 101,
        'receives_losers_from': 1
    }

    # Round 2 matches
    if num_teams >= 25:    # 25-32 teams
        r2_matches = 8
    elif num_teams >= 16:  # 16-24 teams
        r2_matches = 4
    elif num_teams >= 9:   # 9-15 teams
        r2_matches = 2
    else:                  # 4-8 teams
        r2_matches = 1

    structure[2] = {
        'num_matches': r2_matches,
        'start_match_num': 101,
        'receives_losers_from': 2
    }

    # Return early for 4-team tournaments
    if num_teams == 4:
        return structure

    # Round 3 matches
    if num_teams >= 25:    # 25-32 teams
        r3_matches = 4
    elif num_teams >= 16:  # 16-24 teams
        r3_matches = 2
    elif num_teams >= 9:   # 9-15 teams
        r3_matches = 2
    else:                  # 5-8 teams
        r3_matches = 1

    structure[3] = {
        'num_matches': r3_matches,
        'start_match_num': 101,
        'receives_losers_from': 3
    }

    # Return early for 5-6 team tournaments
    if num_teams <= 6:
        return structure

    # Round 4 matches
    if num_teams >= 25:    # 25-32 teams
        r4_matches = 4
    elif num_teams >= 16:  # 16-24 teams
        r4_matches = 2
    elif num_teams >= 9:   # 9-15 teams
        r4_matches = 1
    else:                  # 7-8 teams
        r4_matches = 1

    structure[4] = {
        'num_matches': r4_matches,
        'start_match_num': 101,
        'receives_losers_from': 4
    }

    # Return early for 7-8 team tournaments
    if num_teams <= 8:
        return structure

    # Round 5 matches
    if num_teams >= 25:    # 25-32 teams
        r5_matches = 2
    elif num_teams >= 16:  # 16-24 teams
        r5_matches = 1
    else:                  # 9-15 teams
        r5_matches = 1

    structure[5] = {
        'num_matches': r5_matches,
        'start_match_num': 101,
        'receives_losers_from': 5
    }

    # Return early for 9-15 team tournaments
    if num_teams < 16:
        return structure

    # Round 6 (16+ teams)
    structure[6] = {
        'num_matches': 1,
        'start_match_num': 101,
        'receives_losers_from': 6
    }

    # Return early for 16-24 team tournaments
    if num_teams < 25:
        return structure

    # Round 7 (25+ teams)
    structure[7] = {
        'num_matches': 1,
        'start_match_num': 101,
        'receives_losers_from': 7
    }

    # Round 8 (25+ teams)
    structure[8] = {
        'num_matches': 1,
        'start_match_num': 101,
        'receives_losers_from': 8
    }

    return structure

def get_base_sources() -> dict:
    """Return base empty source tracking dictionary."""
    return {
        'team1_from_winners': False,
        'team1_winners_round': None,
        'team1_winners_match_number': None,
        'team2_from_winners': False,
        'team2_winners_round': None,
        'team2_winners_match_number': None
    }

def calculate_power_2_sources(round_num: int, match_index: int, num_teams: int) -> dict:
    """
    Calculate source tracking for 32, 16, 8, 4 team tournaments.
    
    Args:
        round_num: Current round in losers bracket (1-8)
        match_index: Index within current round (0-based)
        num_teams: Number of teams (32, 16, 8, or 4)
    """
    sources = get_base_sources()
    winners_r1_matches = num_teams // 2  # Number of R1 matches in winners bracket

    if round_num == 1:
        # First round gets losers from Winners R1
        sources.update({
            'team1_from_winners': True,
            'team1_winners_round': 1,
            'team1_winners_match_number': match_index + 1,
            'team2_from_winners': True,
            'team2_winners_round': 1,
            'team2_winners_match_number': winners_r1_matches - match_index  # Counts down from total matches
        })
    
    elif round_num == 2:
        # Second round gets winners from R1 losers and losers from Winners R2
        sources.update({
            'team1_from_winners': False,  # From losers bracket R1
            'team2_from_winners': True,   # From winners bracket R2
            'team2_winners_round': 2,
            'team2_winners_match_number': match_index + 1
        })
    
    elif round_num == 4 and num_teams >= 16:
        # Round 4 gets losers from Winners R3
        sources.update({
            'team1_from_winners': False,
            'team2_from_winners': True,
            'team2_winners_round': 3,
            'team2_winners_match_number': match_index + 1
        })
    
    elif round_num == 6 and num_teams >= 16:
        # Round 6 gets losers from Winners R4
        sources.update({
            'team1_from_winners': False,
            'team2_from_winners': True,
            'team2_winners_round': 4,
            'team2_winners_match_number': match_index + 1
        })
    
    elif round_num == 8 and num_teams == 32:
        # Round 8 (only in 32-team tournaments) gets losers from Winners R5
        sources.update({
            'team1_from_winners': False,
            'team2_from_winners': True,
            'team2_winners_round': 5,
            'team2_winners_match_number': match_index + 1
        })
    
    return sources

def calculate_25_31_sources(round_num: int, match_index: int, num_teams: int) -> dict:
    """
    Calculate source tracking for 25-31 team tournaments.
    
    Args:
        round_num: Current round in losers bracket (1-8)
        match_index: Index within current round (0-based)
        num_teams: Number of teams (25-31)
    """
    sources = get_base_sources()
    num_byes = 32 - num_teams  # Calculate number of byes

    if round_num == 1:
        # First round matches are between R1 losers
        sources.update({
            'team1_from_winners': True,
            'team1_winners_round': 1,
            'team1_winners_match_number': match_index + 8,  # Matches 8-15
            'team2_from_winners': True,
            'team2_winners_round': 1,
            'team2_winners_match_number': match_index + 9   # Matches 9-16
        })
    
    elif round_num == 2:
        if match_index < num_byes:
            # First matches get R1 losers with byes
            sources.update({
                'team1_from_winners': True,
                'team1_winners_round': 1,
                'team1_winners_match_number': match_index + 1
            })
        sources.update({
            'team2_from_winners': True,
            'team2_winners_round': 2,
            'team2_winners_match_number': match_index + 1
        })
    
    elif round_num == 4:
        # Round 4 gets losers from Winners R3
        sources.update({
            'team1_from_winners': False,
            'team2_from_winners': True,
            'team2_winners_round': 3,
            'team2_winners_match_number': match_index + 1
        })
    
    elif round_num == 6:
        # Round 6 gets losers from Winners R4
        sources.update({
            'team1_from_winners': False,
            'team2_from_winners': True,
            'team2_winners_round': 4,
            'team2_winners_match_number': match_index + 1
        })
    
    elif round_num == 8:
        # Round 8 gets losers from Winners R5
        sources.update({
            'team1_from_winners': False,
            'team2_from_winners': True,
            'team2_winners_round': 5,
            'team2_winners_match_number': match_index + 1
        })

    return sources

def calculate_17_24_sources(round_num: int, match_index: int, num_teams: int) -> dict:
    """
    Calculate source tracking for 17-24 team tournaments.
    
    Args:
        round_num: Current round in losers bracket (1-7)
        match_index: Index within current round (0-based)
        num_teams: Number of teams (17-24)
    """
    sources = get_base_sources()

    if round_num == 1:
        # First round matches (varies based on size)
        if num_teams == 24:
            # 24 teams has 8 R1 matches
            sources.update({
                'team1_from_winners': True,
                'team1_winners_round': 1,
                'team1_winners_match_number': match_index + 1,
                'team2_from_winners': True,
                'team2_winners_round': 2,
                'team2_winners_match_number': 8 - match_index  # Counts down 8->1
            })
        else:
            # 17-23 teams
            sources.update({
                'team1_from_winners': True,
                'team1_winners_round': 1,
                'team1_winners_match_number': match_index + 1,
                'team2_from_winners': True,
                'team2_winners_round': 2,
                'team2_winners_match_number': match_index + 1
            })
    
    elif round_num == 2:
        # Second round gets mix of R1 winners and R2 losers
        sources.update({
            'team1_from_winners': False,  # From losers R1
            'team2_from_winners': True,   # From winners R2
            'team2_winners_round': 2,
            'team2_winners_match_number': match_index + 1
        })
    
    elif round_num == 4:
        # Round 4 gets losers from Winners R3
        sources.update({
            'team1_from_winners': False,
            'team2_from_winners': True,
            'team2_winners_round': 3,
            'team2_winners_match_number': match_index + 1
        })
    
    elif round_num == 6:
        # Round 6 gets losers from Winners R4
        sources.update({
            'team1_from_winners': False,
            'team2_from_winners': True,
            'team2_winners_round': 4,
            'team2_winners_match_number': match_index + 1
        })

    return sources

def calculate_13_15_sources(round_num: int, match_index: int, num_teams: int) -> dict:
    """
    Calculate source tracking for 13-15 team tournaments.
    
    Args:
        round_num: Current round in losers bracket (1-6)
        match_index: Index within current round (0-based)
        num_teams: Number of teams (13-15)
    """
    sources = get_base_sources()
    winners_r1_matches = num_teams - 8  # Calculate R1 matches for non-power-2 sizes

    if round_num == 1:
        # First round matches between Winners R1 losers
        sources.update({
            'team1_from_winners': True,
            'team1_winners_round': 1,
            'team1_winners_match_number': match_index + 1,
            'team2_from_winners': True,
            'team2_winners_round': 1,
            'team2_winners_match_number': winners_r1_matches - match_index  # Counts down from total matches
        })
    
    elif round_num == 2:
        # Second round gets winners from R1 losers and losers from Winners R2
        sources.update({
            'team1_from_winners': False,  # From losers R1
            'team2_from_winners': True,   # From winners R2
            'team2_winners_round': 2,
            'team2_winners_match_number': match_index + 1
        })
    
    elif round_num == 4:
        # Round 4 gets losers from Winners R3
        sources.update({
            'team1_from_winners': False,
            'team2_from_winners': True,
            'team2_winners_round': 3,
            'team2_winners_match_number': match_index + 1
        })

    return sources

def calculate_9_12_sources(round_num: int, match_index: int, num_teams: int) -> dict:
    """
    Calculate source tracking for 9-12 team tournaments.
    
    Args:
        round_num: Current round in losers bracket (1-4)
        match_index: Index within current round (0-based)
        num_teams: Number of teams (9-12)
    """
    sources = get_base_sources()

    if round_num == 1:
        if num_teams == 9:
            # Single R1 match: W-R1M1 vs W-R2M3
            sources.update({
                'team1_from_winners': True,
                'team1_winners_round': 1,
                'team1_winners_match_number': 1,
                'team2_from_winners': True,
                'team2_winners_round': 2,
                'team2_winners_match_number': 3
            })
        elif num_teams == 10:
            # Two R1 matches with specific pairings
            match_pairs = [(1,2), (2,1)]  # [W-R1M#, W-R2M#]
            if match_index < len(match_pairs):
                m1, m2 = match_pairs[match_index]
                sources.update({
                    'team1_from_winners': True,
                    'team1_winners_round': 1,
                    'team1_winners_match_number': m1,
                    'team2_from_winners': True,
                    'team2_winners_round': 2,
                    'team2_winners_match_number': m2
                })
        elif num_teams == 11:
            # Three R1 matches with specific pairings
            match_pairs = [(1,3), (2,2), (3,1)]
            if match_index < len(match_pairs):
                m1, m2 = match_pairs[match_index]
                sources.update({
                    'team1_from_winners': True,
                    'team1_winners_round': 1,
                    'team1_winners_match_number': m1,
                    'team2_from_winners': True,
                    'team2_winners_round': 2,
                    'team2_winners_match_number': m2
                })
        else:  # 12 teams
            # Four R1 matches
            sources.update({
                'team1_from_winners': True,
                'team1_winners_round': 1,
                'team1_winners_match_number': match_index + 1,
                'team2_from_winners': True,
                'team2_winners_round': 2,
                'team2_winners_match_number': 4 - match_index
            })
    
    elif round_num == 2:
        if num_teams == 9:
            if match_index == 0:
                # L-R1M101 vs W-R2M2
                sources.update({
                    'team1_from_winners': False,
                    'team2_from_winners': True,
                    'team2_winners_round': 2,
                    'team2_winners_match_number': 2
                })
            else:
                # W-R2M1 vs W-R2M4
                sources.update({
                    'team1_from_winners': True,
                    'team1_winners_round': 2,
                    'team1_winners_match_number': 1,
                    'team2_from_winners': True,
                    'team2_winners_round': 2,
                    'team2_winners_match_number': 4
                })
        elif num_teams == 10:
            # Two R2 matches: L-R1 vs W-R2
            sources.update({
                'team1_from_winners': False,
                'team2_from_winners': True,
                'team2_winners_round': 2,
                'team2_winners_match_number': 4 - match_index
            })
        elif num_teams == 11:
            if match_index == 0:
                # First match: L-R1M101 vs W-R2M4
                sources.update({
                    'team1_from_winners': False,
                    'team2_from_winners': True,
                    'team2_winners_round': 2,
                    'team2_winners_match_number': 4
                })
            else:
                # Second match: L-R1M102 vs L-R1M103
                sources.update({
                    'team1_from_winners': False,
                    'team2_from_winners': False
                })
        else:  # 12 teams
            # Both matches pair R1 losers
            sources.update({
                'team1_from_winners': False,
                'team2_from_winners': False
            })
    
    elif round_num == 3:
        # Round 3 matches pair R2 winners
        sources.update({
            'team1_from_winners': False,
            'team2_from_winners': False
        })
    
    elif round_num == 4:
        # Final losers match
        sources.update({
            'team1_from_winners': False,
            'team2_from_winners': True,
            'team2_winners_round': 3,
            'team2_winners_match_number': match_index + 1
        })

    return sources

def calculate_5_8_sources(round_num: int, match_index: int, num_teams: int) -> dict:
    """
    Calculate source tracking for 5-8 team tournaments.
    
    Args:
        round_num: Current round in losers bracket (1-4)
        match_index: Index within current round (0-based)
        num_teams: Number of teams (5-8)
    """
    sources = get_base_sources()

    if round_num == 1:
        if num_teams == 5:
            # Single R1 match: W-R1M1 vs W-R2M2
            sources.update({
                'team1_from_winners': True,
                'team1_winners_round': 1,
                'team1_winners_match_number': 1,
                'team2_from_winners': True,
                'team2_winners_round': 2,
                'team2_winners_match_number': 2
            })
        elif num_teams == 6:
            # Two R1 matches pairing winners bracket teams
            match_pairs = [(1,2), (2,1)]  # [W-R1M#, W-R2M#]
            if match_index < len(match_pairs):
                m1, m2 = match_pairs[match_index]
                sources.update({
                    'team1_from_winners': True,
                    'team1_winners_round': 1,
                    'team1_winners_match_number': m1,
                    'team2_from_winners': True,
                    'team2_winners_round': 2,
                    'team2_winners_match_number': m2
                })
        elif num_teams == 7:
            # Single R1 match between first two winners losers
            sources.update({
                'team1_from_winners': True,
                'team1_winners_round': 1,
                'team1_winners_match_number': 1,
                'team2_from_winners': True,
                'team2_winners_round': 1,
                'team2_winners_match_number': 2
            })
        else:  # 8 teams
            # Two R1 matches pairing highest vs lowest seeds
            sources.update({
                'team1_from_winners': True,
                'team1_winners_round': 1,
                'team1_winners_match_number': match_index + 1,
                'team2_from_winners': True,
                'team2_winners_round': 1,
                'team2_winners_match_number': 4 - match_index
            })
    
    elif round_num == 2:
        if num_teams <= 6:
            # Single R2 match
            if num_teams == 5:
                # L-R1M101 vs W-R2M1
                sources.update({
                    'team1_from_winners': False,
                    'team2_from_winners': True,
                    'team2_winners_round': 2,
                    'team2_winners_match_number': 1
                })
            else:  # 6 teams
                # L-R1M101 vs L-R1M102
                sources.update({
                    'team1_from_winners': False,
                    'team2_from_winners': False
                })
        else:  # 7-8 teams
            if num_teams == 7:
                if match_index == 0:
                    # First match: L-R1M101 vs W-R2M1
                    sources.update({
                        'team1_from_winners': False,
                        'team2_from_winners': True,
                        'team2_winners_round': 2,
                        'team2_winners_match_number': 1
                    })
                else:
                    # Second match: W-R2M2 vs W-R1M3
                    sources.update({
                        'team1_from_winners': True,
                        'team1_winners_round': 2,
                        'team1_winners_match_number': 2,
                        'team2_from_winners': True,
                        'team2_winners_round': 1,
                        'team2_winners_match_number': 3
                    })
            else:  # 8 teams
                # Two R2 matches pairing R1 losers with R2 losers
                sources.update({
                    'team1_from_winners': False,
                    'team2_from_winners': True,
                    'team2_winners_round': 2,
                    'team2_winners_match_number': match_index + 1
                })
    
    elif round_num == 3:
        # R3 matches pair R2 winners
        sources.update({
            'team1_from_winners': False,
            'team2_from_winners': False
        })
    
    elif round_num == 4:
        # Only 7-8 team tournaments have R4
        if num_teams >= 7:
            sources.update({
                'team1_from_winners': False,
                'team2_from_winners': True,
                'team2_winners_round': 3,
                'team2_winners_match_number': match_index + 1
            })

    return sources

def calculate_match_sources(tournament_id: int, num_teams: int, round_num: int, match_num: int) -> dict:
    """
    Calculate source tracking info for a specific match in the losers bracket.
    Routes to appropriate calculator based on tournament size.
    
    Args:
        tournament_id: ID of the tournament
        num_teams: Total number of teams in tournament (4-32)
        round_num: Current round in losers bracket (1-8)
        match_num: Match number (101+)
    
    Returns:
        dict: Source tracking information for both teams in the match
    """
    # Validate inputs
    if not 4 <= num_teams <= 32:
        raise ValueError("Number of teams must be between 4 and 32")
    if round_num < 1:
        raise ValueError("Round number must be positive")
    if match_num < 101:
        raise ValueError("Match number must be 101 or greater")

    # Convert match number to 0-based index
    match_index = match_num - 101

    # Route to appropriate calculator based on tournament size
    if num_teams == 32 or num_teams == 16 or num_teams == 8 or num_teams == 4:
        # Power of 2 sizes
        return calculate_power_2_sources(round_num, match_index, num_teams)
    elif 25 <= num_teams <= 31:
        return calculate_25_31_sources(round_num, match_index, num_teams)
    elif 17 <= num_teams <= 24:
        return calculate_17_24_sources(round_num, match_index, num_teams)
    elif 13 <= num_teams <= 16:
        return calculate_13_15_sources(round_num, match_index, num_teams)
    elif 9 <= num_teams <= 12:
        return calculate_9_12_sources(round_num, match_index, num_teams)
    else:  # 5-8 teams
        return calculate_5_8_sources(round_num, match_index, num_teams)

def generate_losers_bracket(tournament_id: int, num_teams: int, db: Session) -> List[LosersMatch]:
    structure = calculate_losers_bracket_structure(num_teams)
    matches = []
    matches_by_round = {}

    for round_num in sorted(structure.keys()):
        round_matches = []
        round_info = structure[round_num]
        
        for i in range(round_info['num_matches']):
            # Get source tracking info
            match_num = round_info['start_match_num'] + i
            sources = calculate_match_sources(tournament_id, num_teams, round_num, match_num)
            
            match = LosersMatch(
                tournament_id=tournament_id,
                round=round_num,
                match_number=round_info['start_match_num'] + i,
                team1_id=None,
                team2_id=None,
                winner_id=None,
                next_match_id=None,
                **sources  # Unpack all source tracking fields
            )
            
            db.add(match)
            round_matches.append(match)
        
        matches_by_round[round_num] = round_matches
        matches.extend(round_matches)

    db.flush()

    # Second pass: Link matches between rounds
    for round_num in range(1, max(structure.keys())):
        current_matches = matches_by_round[round_num]
        if round_num + 1 in matches_by_round:
            next_round_matches = matches_by_round[round_num + 1]

            if round_num == 1:  # Keep your existing R1->R2 special handling
                if num_teams in [32, 16, 8, 4]:
                    # Standard power of 2 linking...
                    for curr_match in current_matches:
                        match_index = curr_match.match_number - 101
                        if match_index < len(next_round_matches):
                            curr_match.next_match_id = next_round_matches[match_index].id

                elif 25 <= num_teams <= 31:
                    # Add bye offset for R1 matches...
                    num_byes = 32 - num_teams
                    for curr_match in current_matches:
                        match_index = curr_match.match_number - 101
                        if match_index < len(next_round_matches):
                            next_match = next_round_matches[match_index]
                            curr_match.next_match_id = next_match.id + num_byes

                elif 17 <= num_teams <= 23:
                    # Ensure every R1 match has a corresponding R2 match...
                    for i, curr_match in enumerate(current_matches):
                        if i < len(next_round_matches):
                            next_match_id = next_round_matches[i].id
                        else:
                            reverse_idx = len(next_round_matches) - (i - len(next_round_matches) + 1)
                            if 0 <= reverse_idx < len(next_round_matches):
                                next_match_id = next_round_matches[reverse_idx].id
                        curr_match.next_match_id = next_match_id

                elif 13 <= num_teams <= 16:
                    # Direct 1-to-1 mapping for first half...
                    num_matches = len(current_matches)
                    for i, curr_match in enumerate(current_matches):
                        if i < num_matches // 2:
                            if i < len(next_round_matches):
                                curr_match.next_match_id = next_round_matches[i].id
                        else:
                            reverse_index = num_matches - 1 - i
                            if reverse_index < len(next_round_matches):
                                curr_match.next_match_id = next_round_matches[reverse_index].id

                elif 9 <= num_teams <= 11:
                    if num_teams == 11:
                        current_matches[0].next_match_id = next_round_matches[0].id
                        current_matches[1].next_match_id = next_round_matches[1].id
                        current_matches[2].next_match_id = next_round_matches[1].id
                    elif num_teams == 10:
                        for i, curr_match in enumerate(current_matches):
                            curr_match.next_match_id = next_round_matches[i].id
                    else:  # 9 teams
                        current_matches[0].next_match_id = next_round_matches[0].id
                        
                elif 5 <= num_teams <= 7:
                    if num_teams == 5:
                        if current_matches[0]:
                            current_matches[0].next_match_id = next_round_matches[0].id
                            print(f"5 teams: Linking L-R1M101 to L-R2M101")
                    elif num_teams == 6:
                        # Both R1 matches go to R2M101
                        for curr_match in current_matches:
                            curr_match.next_match_id = next_round_matches[0].id
                            print(f"6 teams: Linking L-R1M{curr_match.match_number} to L-R2M101")
                    elif num_teams == 7:
                        # Single R1 match goes to R2M101
                        current_matches[0].next_match_id = next_round_matches[0].id
                        print(f"7 teams: Linking L-R1M101 to L-R2M101")

            else:  # Use exact same code for R2 and beyond for all tournament sizes
                print(f"\nProcessing Round {round_num}")
                print(f"Current matches: {[m.match_number for m in current_matches]}")
                print(f"Next round matches: {[m.match_number for m in next_round_matches]}")
                
                if round_num % 2 == 0:  # Even rounds (2, 4, 6, 8)
                    print(f"Even round {round_num}")
                    if len(current_matches) == 1 and len(next_round_matches) > 0:
                        # Special case: Only one match in current round
                        curr_match = current_matches[0]
                        next_match = next_round_matches[0]
                        print(f"Single match progression: Linking match {curr_match.match_number} to {next_match.match_number}")
                        curr_match.next_match_id = next_match.id
                    else:
                        # Normal pairing for multiple matches
                        for i in range(len(current_matches) // 2):
                            if i < len(next_round_matches):
                                next_match = next_round_matches[i]
                                low_idx = i
                                high_idx = len(current_matches) - 1 - i
                                if low_idx < len(current_matches) and high_idx >= 0:
                                    low_match = current_matches[low_idx]
                                    high_match = current_matches[high_idx]
                                    print(f"Linking matches {low_match.match_number} and {high_match.match_number} to {next_match.match_number}")
                                    low_match.next_match_id = next_match.id
                                    high_match.next_match_id = next_match.id
                
                else:  # Odd rounds (3, 5, 7)
                    print(f"Odd round {round_num}")
                    
                    if len(next_round_matches) > 0:
                        next_match = next_round_matches[0]  # Always use first match of next round
                        for curr_match in current_matches:
                            print(f"Linking match {curr_match.match_number} to match {next_match.match_number}")
                            curr_match.next_match_id = next_match.id

    db.commit()
    return matches

def handle_power_2_teams(tournament_id: int, winners_match_num: int, winners_round: int, loser_id: int, db: Session) -> Optional[LosersMatch]:
    """
    Handle loser placement for tournaments with team counts that are powers of 2 (32, 16, 8, 4).
    Now returns the match object for source tracking.
    """
    # Get tournament to determine number of teams
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    num_teams = len(tournament.teams)
    
    # Calculate number of R1 matches
    r1_matches = num_teams // 4  # 32->8, 16->4, 8->2, 4->1
    
    if winners_round == 1:
        if winners_match_num <= r1_matches:
            # First half of matches go to team1 spots
            l_r1_match = 100 + winners_match_num
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 1,
                    LosersMatch.match_number == l_r1_match
                ).first()
            
            if losers_match:
                losers_match.team1_id = loser_id
                return losers_match
        else:
            # Second half go to team2 spots in reverse order
            l_r1_match = 100 + (2 * r1_matches + 1 - winners_match_num)
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 1,
                    LosersMatch.match_number == l_r1_match
                ).first()
            
            if losers_match:
                losers_match.team2_id = loser_id
                return losers_match
    
    elif winners_round == 2:
        # Calculate highest match number for this bracket size
        max_match = 100 + r1_matches
        
        # Place R2 losers in reverse order
        l_r2_match = max_match - winners_match_num + 1
        
        losers_match = db.query(LosersMatch)\
            .filter(
                LosersMatch.tournament_id == tournament_id,
                LosersMatch.round == 2,
                LosersMatch.match_number == l_r2_match
            ).first()
        
        if losers_match:
            # For R2, first half get team1, second half get team2
            if winners_match_num <= r1_matches // 2:
                losers_match.team1_id = loser_id
            else:
                losers_match.team2_id = loser_id
            return losers_match
    
    return None

def handle_25_31_team_losers(tournament_id: int, winners_match_num: int, winners_round: int, loser_id: int, db: Session) -> None:
    """
    Handle loser placement for tournaments with 25-31 teams.
    
    Number of byes determines how many R1 losers go directly to R2:
    31 teams (1 bye): W-R1M1 to R2
    30 teams (2 byes): W-R1M1,2 to R2
    29 teams (3 byes): W-R1M1,2,3 to R2
    etc.
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    num_teams = len(tournament.teams)
    num_byes = 32 - num_teams
    
    if winners_round == 1:
        if winners_match_num <= num_byes:
            # First num_byes matches from R1 go directly to R2
            l_r2_match = 100 + winners_match_num  # M1->101, M2->102, M3->103 for 29 teams
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 2,
                    LosersMatch.match_number == l_r2_match
                ).first()
            
            if losers_match:
                losers_match.team1_id = loser_id
        
        elif num_byes < winners_match_num <= 8:
            # Remaining R1 matches until 8 go to L-R1 as team1
            l_r1_match = 100 + (8 - winners_match_num + 1)  # 8->101, 7->102, etc.
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 1,
                    LosersMatch.match_number == l_r1_match
                ).first()
            
            if losers_match:
                losers_match.team1_id = loser_id
                
        else:  # winners_match_num > 8
            # Matches after 8 go to L-R1 as team2
            l_r1_match = 100 + (winners_match_num - 8)  # 9->101, 10->102, etc.
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 1,
                    LosersMatch.match_number == l_r1_match
                ).first()
            
            if losers_match:
                losers_match.team2_id = loser_id
                    
    elif winners_round == 2:
        if num_teams == 25:
        # Special handling for 25 teams
            if winners_match_num == 8:
                # W-R2M8 goes to L-R2M108 as team2
                l_r2_match = 108
            else:
                # W-R2M1-7 go to matches 101-107 as team2
                l_r2_match = 100 + winners_match_num
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 2,
                    LosersMatch.match_number == l_r2_match
                ).first()
        
            if losers_match:
                losers_match.team2_id = loser_id
        else:
            # Normal handling for 26-31 teams
            if winners_match_num == 8:
            # W-R2M8 goes to L-R2M101 as team2
                l_r2_match = 101
            else:
            # W-R2M7 through W-R2M1 go to L-R2M102 through M108 as team2
                l_r2_match = 101 + (8 - winners_match_num)  # 7->102, 6->103, etc.
                
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 2,
                    LosersMatch.match_number == l_r2_match
                ).first()
            
            if losers_match:
                losers_match.team2_id = loser_id

def handle_24_12_team_losers(tournament_id: int, winners_match_num: int, winners_round: int, loser_id: int, db: Session) -> None:
    """
    Handle loser placement for tournaments with 24 or 12 teams.
    
    24 Teams:
    R1: 8 matches (W-R1M1 vs W-R2M8 through W-R1M8 vs W-R2M1)
    R2: 4 matches (pairing L-R1 matches)
    
    12 Teams:
    R1: 4 matches (W-R1M1 vs W-R2M4 through W-R1M4 vs W-R2M1)
    R2: 2 matches (pairing L-R1 matches)
    """
    # Get tournament to determine number of teams
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    num_teams = len(tournament.teams)
    
    # Calculate number of R1 matches
    r1_matches = 8 if num_teams == 24 else 4
    
    if winners_round == 1:
        if winners_match_num <= r1_matches:
            l_r1_match = 100 + winners_match_num
            is_team1 = winners_match_num # <= r1_matches // 2
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 1,
                    LosersMatch.match_number == l_r1_match
                ).first()
            
            if losers_match:
                if is_team1:
                    losers_match.team1_id = loser_id
                else:
                    losers_match.team2_id = loser_id
                    
    elif winners_round == 2:
        if winners_match_num <= r1_matches:
            # Match R2 losers with R1 losers
            l_r1_match = 100 + winners_match_num 
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 1,
                    LosersMatch.match_number == l_r1_match
                ).first()
            
            if losers_match:
                # R2 losers always go to team2
                losers_match.team2_id = loser_id
                
def handle_17_23_team_losers(tournament_id: int, winners_match_num: int, winners_round: int, loser_id: int, total_r1_matches: int, db: Session) -> None:
    """
    Handle loser placement for tournaments with 17-23 teams.
    Round 1 matches: W-R1Mx vs W-R2Mx
    Round 2:
    - L-R2M101: L-R1M101 vs W-R2M8 always
    - Then L-R1 winners (if any) vs highest remaining W-R2 losers
    - Then remaining W-R2 losers pair high vs low
    """
    if winners_round == 1:
        # R1 losers go to corresponding L-R1 match
        l_r1_match = 100 + winners_match_num
        print(f"17-23 teams - R1: W-R1M{winners_match_num} → L-R1M{l_r1_match} as team1")
        
        losers_match = db.query(LosersMatch)\
            .filter(
                LosersMatch.tournament_id == tournament_id,
                LosersMatch.round == 1,
                LosersMatch.match_number == l_r1_match
            ).first()
        
        if losers_match:
            losers_match.team1_id = loser_id
            
    elif winners_round == 2:
        if winners_match_num == 8:
            # W-R2M8 always goes to L-R2M101 as team2
            l_r2_match = 101
            print(f"17-23 teams - R2: W-R2M8 → L-R2M{l_r2_match} as team2")
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 2,
                    LosersMatch.match_number == l_r2_match
                ).first()
            
            if losers_match:
                losers_match.team2_id = loser_id
                
        elif winners_match_num <= total_r1_matches:
            # These matches face R1 losers in L-R1
            l_r1_match = 100 + winners_match_num
            print(f"17-23 teams - R2: W-R2M{winners_match_num} → L-R1M{l_r1_match} as team2")
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 1,
                    LosersMatch.match_number == l_r1_match
                ).first()
            
            if losers_match:
                losers_match.team2_id = loser_id
        
        elif winners_match_num == 7:
            # W-R2M7 goes to L-R2M102 if there's an L-R1M102 winner, otherwise pairs with W-R2M2
            l_r2_match = 102
            print(f"17-23 teams - R2: W-R2M7 → L-R2M{l_r2_match} as team2")
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 2,
                    LosersMatch.match_number == l_r2_match
                ).first()
            
            if losers_match:
                losers_match.team2_id = loser_id
                
        elif winners_match_num == 6:
            # W-R2M6 goes to L-R2M103 if there's an L-R1M103 winner, otherwise pairs with W-R2M3
            l_r2_match = 103
            print(f"17-23 teams - R2: W-R2M6 → L-R2M{l_r2_match} as team2")
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 2,
                    LosersMatch.match_number == l_r2_match
                ).first()
            
            if losers_match:
                losers_match.team2_id = loser_id
                
        elif winners_match_num == 5:
            # W-R2M5 goes to L-R2M104 if there's an L-R1M104 winner, otherwise pairs with W-R2M4
            l_r2_match = 104
            print(f"17-23 teams - R2: W-R2M5 → L-R2M{l_r2_match} as team2")
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 2,
                    LosersMatch.match_number == l_r2_match
                ).first()
            
            if losers_match:
                losers_match.team2_id = loser_id
                
        else:
            # W-R2M2, W-R2M3, W-R2M4 pair up with their corresponding high numbers if no L-R1 winner exists
            # The match numbers are fixed based on remaining available slots
            if winners_match_num == 2:
                l_r2_match = 102
            elif winners_match_num == 3:
                l_r2_match = 103
            elif winners_match_num == 4:
                l_r2_match = 104
                
            print(f"17-23 teams - R2: W-R2M{winners_match_num} → L-R2M{l_r2_match} as team1")
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 2,
                    LosersMatch.match_number == l_r2_match
                ).first()
            
            if losers_match:
                losers_match.team1_id = loser_id

def handle_13_16_team_losers(tournament_id: int, winners_match_num: int, winners_round: int, loser_id: int, db: Session) -> None:
    """
    Handle loser placement for tournaments with 13-16 teams.
    
    16 Teams: Traditional bracket
    R1: W-R1M1 vs W-R1M8 through pairs
    R2: L-R1M101 vs W-R2M4 down to W-R2M1
    
    15 Teams:
    R1: 3 matches (1v6, 2v5, 3v4)
    R2: L-R1M101 vs W-R1M7, then L-R1/W-R2 pairs
    
    14 Teams:
    R1: 2 matches (1v4, 2v3)
    R2: L-R1M101 vs W-R1M6, L-R1M102 vs W-R1M5, then W-R2 pairs
    
    13 Teams:
    R1: 1 match (1v2)
    R2: L-R1M101 vs W-R1M5, then W-R2/W-R1 specific pairings
    """
    # Get tournament to determine exact size
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    num_teams = len(tournament.teams)
    
    if num_teams == 16:
        # Handle traditional 16-team format
        if winners_round == 1:
            if winners_match_num <= 8:
                l_r1_match = 100 + winners_match_num
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 1,
                        LosersMatch.match_number == l_r1_match
                    ).first()
                    
                if losers_match:
                    is_team1 = winners_match_num <= 4
                    if is_team1:
                        losers_match.team1_id = loser_id
                    else:
                        losers_match.team2_id = loser_id
        
        elif winners_round == 2:
            # R2 losers placed sequentially
            l_r2_match = 100 + winners_match_num
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 2,
                    LosersMatch.match_number == l_r2_match
                ).first()
                
            if losers_match:
                losers_match.team2_id = loser_id
    
    elif num_teams == 15:
        if winners_round == 1:
            if winners_match_num <= 3:  # First half of R1 pairs
                l_r1_match = 100 + winners_match_num
                is_team1 = True
            elif winners_match_num <= 6:  # Second half of R1 pairs
                l_r1_match = 100 + (7 - winners_match_num)
                is_team1 = False
            else:  # Match 7 goes to L-R2M101
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 2,
                        LosersMatch.match_number == 101
                    ).first()
                
                if losers_match:
                    losers_match.team2_id = loser_id
                return
                
            # Handle R1 matches going to L-R1
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 1,
                    LosersMatch.match_number == l_r1_match
                ).first()
                
            if losers_match:
                if is_team1:
                    losers_match.team1_id = loser_id
                else:
                    losers_match.team2_id = loser_id
                    
        elif winners_round == 2:
            if winners_match_num <= 2:
                # R2M1,2 go to L-R2M102,103 as team2
                l_r2_match = 101 + winners_match_num
            else:
                # R2M3,4 go to L-R2M104
                l_r2_match = 104
                
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 2,
                    LosersMatch.match_number == l_r2_match
                ).first()
                
            if losers_match:
                if winners_match_num <= 2:
                    losers_match.team2_id = loser_id
                else:
                    if winners_match_num == 3:
                        losers_match.team1_id = loser_id
                    else:
                        losers_match.team2_id = loser_id
    
    elif num_teams == 14:
        if winners_round == 1:
            if winners_match_num <= 2:  # First half of R1 pairs
                l_r1_match = 100 + winners_match_num
                is_team1 = True
            elif winners_match_num <= 4:  # Second half of R1 pairs
                l_r1_match = 100 + (5 - winners_match_num)
                is_team1 = False
            elif winners_match_num == 5 or winners_match_num == 6:  
                # W-R1M5 goes to L-R2M102 as team2
                # W-R1M6 goes to L-R2M101 as team2
                l_r2_match = 103 - (winners_match_num - 4)  
            
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 2,
                        LosersMatch.match_number == l_r2_match
                    ).first()
            
                if losers_match:
                    losers_match.team2_id = loser_id
                return
                
            # Handle R1 matches going to L-R1
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 1,
                    LosersMatch.match_number == l_r1_match
                ).first()
            
            if losers_match:
                if is_team1:
                    losers_match.team1_id = loser_id
                else:
                    losers_match.team2_id = loser_id
                    
        elif winners_round == 2:
            # Special R2 handling for 14 teams
            if winners_match_num == 1:
                # W-R2M1 goes to L-R2M103 as team1
                l_r2_match = 103
                is_team1 = True
            elif winners_match_num == 2:
                # W-R2M2 goes to L-R2M104 as team1
                l_r2_match = 104
                is_team1 = True
            elif winners_match_num == 3:
                # W-R2M3 goes to L-R2M104 as team2
                l_r2_match = 104
                is_team1 = False
            elif winners_match_num == 4:
                # W-R2M4 goes to L-R2M103 as team2
                l_r2_match = 103
                is_team1 = False
        
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == 2,
                    LosersMatch.match_number == l_r2_match
                ).first()

            if losers_match:
                if is_team1:
                    losers_match.team1_id = loser_id
                else:
                    losers_match.team2_id = loser_id

    elif num_teams == 13:
        if winners_round == 1:
            if winners_match_num <= 2:  # First pair goes to L-R1
                l_r1_match = 101
                is_team1 = winners_match_num == 1
                
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 1,
                        LosersMatch.match_number == l_r1_match
                    ).first()
                
                if losers_match:
                    if is_team1:
                        losers_match.team1_id = loser_id
                    else:
                        losers_match.team2_id = loser_id
                        
            elif winners_match_num <= 5:  # Matches 3-5 go to L-R2
                l_r2_match = 103 - (winners_match_num - 3)  # Maps 3->103, 4->102, 5->101
                
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 2,
                        LosersMatch.match_number == l_r2_match
                    ).first()
                
                if losers_match:
                    losers_match.team2_id = loser_id
                    
        elif winners_round == 2:
            if winners_match_num <= 3:
                # R2M1-3 go to L-R2M102-104 as team1
                l_r2_match = 101 + winners_match_num
                
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 2,
                        LosersMatch.match_number == l_r2_match
                    ).first()
                
                if losers_match:
                    losers_match.team1_id = loser_id
            else:
                # R2M4 goes to L-R2M104 as team2
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 2,
                        LosersMatch.match_number == 104
                    ).first()
                
                if losers_match:
                    losers_match.team2_id = loser_id

def handle_9_11_team_losers(tournament_id: int, winners_match_num: int, winners_round: int, loser_id: int, db: Session) -> None:
    """
    Handle loser placement for tournaments with 9-11 teams.
    
    9 Teams: 
    R1: M101: W-R1M1 vs W-R2M1
    R2: M101: L-R1M101 vs W-R2M4
        M102: W-R2M2 vs W-R2M3

    10 Teams:
    R1: M101: W-R1M1 vs W-R2M2
        M102: W-R1M2 vs W-R2M1
    R2: M101: L-R1M101 vs W-R2M4
        M102: L-R1M102 vs W-R2M3

    11 Teams:
    R1: M101: W-R1M1 vs W-R2M3
        M102: W-R1M2 vs W-R2M2
        M103: W-R1M3 vs W-R2M1
    R2: M101: L-R1M101 vs W-R2M4
        M102: L-R1M102 vs L-R1M103
    """
    # Get tournament to determine exact size
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    num_teams = len(tournament.teams)
    
    if winners_round == 1:
        if num_teams == 9:
            # Single R1 match: W-R1M1 vs W-R2M1
            if winners_match_num == 1:
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 1,
                        LosersMatch.match_number == 101
                    ).first()
                if losers_match:
                    losers_match.team1_id = loser_id
                    print(f"9 teams R1: Setting team1_id of L-R1M101 to loser from W-R1M1")
                    
        elif num_teams == 10:
            # Two R1 matches: M101: W-R1M1 vs W-R2M2, M102: W-R1M2 vs W-R2M1
            if winners_match_num <= 2:
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 1,
                        LosersMatch.match_number == 100 + winners_match_num
                    ).first()
                if losers_match:
                    losers_match.team1_id = loser_id
                    print(f"10 teams R1: Setting team1_id of L-R1M{100 + winners_match_num} to loser from W-R1M{winners_match_num}")
                    
        elif num_teams == 11:
            # Three R1 matches mapping to specific R2 matches
            if winners_match_num <= 3:
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 1,
                        LosersMatch.match_number == 100 + winners_match_num
                    ).first()
                if losers_match:
                    losers_match.team1_id = loser_id
                    print(f"11 teams R1: Setting team1_id of L-R1M{100 + winners_match_num} to loser from W-R1M{winners_match_num}")
                    
    elif winners_round == 2:
        if num_teams == 9:
            if winners_match_num == 3:
                # W-R2M3 goes to L-R1M101 as team2
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 1,
                        LosersMatch.match_number == 101
                    ).first()
                if losers_match:
                    losers_match.team2_id = loser_id
                    print(f"9 teams R2: Setting team2_id of L-R2M101 to loser from W-R2M4")
            elif winners_match_num == 2:
                # W-R2M2 goes to L-R2M101 as team2
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 2,
                        LosersMatch.match_number == 101
                    ).first()
                if losers_match:
                    losers_match.team2_id = loser_id
                    print(f"9 teams R2: Setting team2_id of L-R1M101 to loser from W-R2M3")
                        
            elif winners_match_num in [1, 4]:
                # W-R2M1 and W-R2M4 go to L-R2M102 as team1 and team2 respectively
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 2,
                        LosersMatch.match_number == 102
                    ).first()
                if losers_match:
                    if winners_match_num == 1:
                        losers_match.team1_id = loser_id  # W-R2M1 goes to team1
                    else:  # winners_match_num == 4
                        losers_match.team2_id = loser_id  # W-R2M4 goes to team2
                    print(f"9 teams R2: Setting {'team1' if winners_match_num == 2 else 'team2'}_id of L-R2M102 to loser from W-R2M{winners_match_num}")
                        
        elif num_teams == 10:
            if winners_match_num == 4:
                # W-R2M4 goes to L-R2M101
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 2,
                        LosersMatch.match_number == 101
                    ).first()
                if losers_match:
                    losers_match.team2_id = loser_id
                    print(f"10 teams R2: Setting team2_id of L-R2M101 to loser from W-R2M4")
            elif winners_match_num == 3:
                # W-R2M3 goes to L-R2M102
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 2,
                        LosersMatch.match_number == 102
                    ).first()
                if losers_match:
                    losers_match.team2_id = loser_id
                    print(f"10 teams R2: Setting team2_id of L-R2M102 to loser from W-R2M3")
            elif winners_match_num in [1, 2]:
                # W-R2M2 goes to L-R1M101 team2
                # W-R2M1 goes to L-R1M102 team2
                l_r1_match = 100 + winners_match_num  # Maps: 1->101, 2->102
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 1,
                        LosersMatch.match_number == l_r1_match
                    ).first()
                if losers_match:
                    losers_match.team2_id = loser_id
                    print(f"10 teams R2: Setting team2_id of L-R1M{l_r1_match} to loser from W-R2M{winners_match_num}")
                
        elif num_teams == 11:
            if winners_match_num == 4:
                # W-R2M4 goes to L-R2M101 as team2
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 2,
                        LosersMatch.match_number == 101
                    ).first()
                if losers_match:
                    losers_match.team2_id = loser_id
                    print(f"11 teams R2: Setting team2_id of L-R2M101 to loser from W-R2M4")
            elif winners_match_num in [1, 2, 3]:
                # W-R2M3 goes to L-R1M101 team2
                # W-R2M2 goes to L-R1M102 team2
                # W-R2M1 goes to L-R1M103 team2
                l_r1_match = 103 - (winners_match_num - 1)  # Maps: 1->103, 2->102, 3->101
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 1,
                        LosersMatch.match_number == l_r1_match
                    ).first()
                if losers_match:
                    losers_match.team2_id = loser_id
                    print(f"11 teams R2: Setting team2_id of L-R1M{l_r1_match} to loser from W-R2M{winners_match_num}")
    
    db.commit()
    
def handle_5_7_team_losers(tournament_id: int, winners_match_num: int, winners_round: int, loser_id: int, db: Session) -> None:
    """
    Handle loser placement for tournaments with 5-7 teams.
    
    5 Teams: 
    R1: M101: W-R1M1 vs W-R2M2
    R2: M101: L-R1M101 vs W-R2M1

    6 Teams:
    R1: M101: W-R1M1 vs W-R2M2
        M102: W-R1M2 vs W-R2M1
    R2: M101: L-R1M101 vs L-R1M102

    7 Teams:
    R1: M101: W-R1M1 vs W-R1M2
    R2: M101: L-R1M101 vs W-R2M1
        M102: W-R2M2 vs W-R1M3
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    num_teams = len(tournament.teams)
    
    if winners_round == 1:
        if num_teams == 5:
            # Single R1 match: W-R1M1 vs W-R2M2
            if winners_match_num == 1:
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 1,
                        LosersMatch.match_number == 101
                    ).first()
                if losers_match:
                    losers_match.team1_id = loser_id
                    print(f"5 teams R1: Setting team1_id of L-R1M101 to loser from W-R1M1")
                    
        elif num_teams == 6:
            # Two R1 matches
            if winners_match_num <= 2:
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 1,
                        LosersMatch.match_number == 100 + winners_match_num
                    ).first()
                if losers_match:
                    losers_match.team1_id = loser_id
                    print(f"6 teams R1: Setting team1_id of L-R1M{100 + winners_match_num} to loser from W-R1M{winners_match_num}")
                    
        elif num_teams == 7:
            # Single R1 match between W-R1M1 and W-R1M2
            if winners_match_num <= 2:
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 1,
                        LosersMatch.match_number == 101
                    ).first()
                if losers_match:
                    if winners_match_num == 1:
                        losers_match.team1_id = loser_id
                    else:  # winners_match_num == 2
                        losers_match.team2_id = loser_id
                    print(f"7 teams R1: Setting {'team1' if winners_match_num == 1 else 'team2'}_id of L-R1M101 to loser from W-R1M{winners_match_num}")
            elif winners_match_num == 3:  # W-R1M3 goes to L-R2M102 team2
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 2,
                        LosersMatch.match_number == 102
                    ).first()
                if losers_match:
                    losers_match.team2_id = loser_id
                    print(f"7 teams R1: Setting team2_id of L-R2M102 to loser from W-R1M3")
                    
    elif winners_round == 2:
        if num_teams == 5:
            if winners_match_num == 2:
                # W-R2M2 goes to L-R1M101 as team2
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 1,
                        LosersMatch.match_number == 101
                    ).first()
                if losers_match:
                    losers_match.team2_id = loser_id
                    print(f"5 teams R2: Setting team2_id of L-R1M101 to loser from W-R2M2")
            elif winners_match_num == 1:
                # W-R2M1 goes to L-R2M101 as team2
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 2,
                        LosersMatch.match_number == 101
                    ).first()
                if losers_match:
                    losers_match.team2_id = loser_id
                    print(f"5 teams R2: Setting team2_id of L-R2M101 to loser from W-R2M1")
                    
        elif num_teams == 6:
            if winners_match_num in [1, 2]:
                # W-R2M1 and W-R2M2 go to L-R1M102 and L-R1M101 respectively as team2
                l_r1_match = 102 - (winners_match_num - 1)  # Maps: 1->102, 2->101
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 1,
                        LosersMatch.match_number == l_r1_match
                    ).first()
                if losers_match:
                    losers_match.team2_id = loser_id
                    print(f"6 teams R2: Setting team2_id of L-R1M{l_r1_match} to loser from W-R2M{winners_match_num}")
                    
        elif num_teams == 7:
            if winners_match_num == 1:
                # W-R2M1 goes to L-R2M101 as team2
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 2,
                        LosersMatch.match_number == 101
                    ).first()
                if losers_match:
                    losers_match.team2_id = loser_id
                    print(f"7 teams R2: Setting team2_id of L-R2M101 to loser from W-R2M1")
            elif winners_match_num == 2:
                # W-R2M2 goes to L-R2M102 as team1
                losers_match = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == tournament_id,
                        LosersMatch.round == 2,
                        LosersMatch.match_number == 102
                    ).first()
                if losers_match:
                    losers_match.team1_id = loser_id
                    print(f"7 teams R2: Setting team1_id of L-R2M102 to loser from W-R2M2")

    db.commit()    

def add_loser_to_bracket(tournament_id: int, loser_id: int, winners_match_num: int, winners_round: int, num_teams: int, db: Session) -> None:
    """
    Place team that lost in winners bracket into appropriate losers match.
    Now includes source tracking for where teams come from.
    """
    def update_source_info(match: LosersMatch, is_team1: bool):
        """Helper function to update source tracking information"""
        if is_team1:
            match.team1_from_winners = True
            match.team1_winners_round = winners_round
            match.team1_winners_match_number = winners_match_num
            match.team1_losers_match_id = None
        else:
            match.team2_from_winners = True
            match.team2_winners_round = winners_round
            match.team2_winners_match_number = winners_match_num
            match.team2_losers_match_id = None
        db.flush()

    # Calculate tournament structure
    next_power = 2 ** ceil(log2(num_teams))
    num_byes = next_power - num_teams
    total_r1_matches = (num_teams - num_byes) // 2
    
    print(f"Debug - Total teams: {num_teams}, Next power: {next_power}, Byes: {num_byes}")
    
    if num_teams in [32, 16, 8, 4]:
        match = handle_power_2_teams(tournament_id, winners_match_num, winners_round, loser_id, db)
        if match:
            is_team1 = match.team1_id == loser_id
            update_source_info(match, is_team1)
        
    elif 25 <= num_teams <= 31:
        match = handle_25_31_team_losers(tournament_id, winners_match_num, winners_round, loser_id, db)
        if match:
            is_team1 = match.team1_id == loser_id
            update_source_info(match, is_team1)
    
    elif num_teams in [24, 12]:
        match = handle_24_12_team_losers(tournament_id, winners_match_num, winners_round, loser_id, db)
        if match:
            is_team1 = match.team1_id == loser_id
            update_source_info(match, is_team1)
    
    elif 17 <= num_teams <= 23:
        match = handle_17_23_team_losers(tournament_id, winners_match_num, winners_round, loser_id, total_r1_matches, db)
        if match:
            is_team1 = match.team1_id == loser_id
            update_source_info(match, is_team1)
    
    elif 13 <= num_teams <= 16:
        match = handle_13_16_team_losers(tournament_id, winners_match_num, winners_round, loser_id, db)
        if match:
            is_team1 = match.team1_id == loser_id
            update_source_info(match, is_team1)
    
    elif 9 <= num_teams <= 11:
        match = handle_9_11_team_losers(tournament_id, winners_match_num, winners_round, loser_id, db)
        if match:
            is_team1 = match.team1_id == loser_id
            update_source_info(match, is_team1)
    
    elif 5 <= num_teams <= 7:
        match = handle_5_7_team_losers(tournament_id, winners_match_num, winners_round, loser_id, db)
        if match:
            is_team1 = match.team1_id == loser_id
            update_source_info(match, is_team1)
    
    else:
        raise ValueError(f"Invalid number of teams: {num_teams}. Must be between 4 and 32.")
    
    db.commit()
    
def update_losers_bracket(match_id: int, winner_id: int, db: Session) -> LosersMatch:
    """
    Handle updates for losers bracket matches and track progression source.
    """
    match = db.query(LosersMatch).filter(LosersMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    match.winner_id = winner_id
    db.flush()

    # Handle progression with source tracking
    if match.next_match_id:
        next_match = db.query(LosersMatch).filter(LosersMatch.id == match.next_match_id).first()
        if next_match:
            if not next_match.team1_id:
                next_match.team1_id = winner_id
                next_match.team1_from_winners = False
                next_match.team1_winners_round = None
                next_match.team1_winners_match_number = None
                next_match.team1_losers_match_id = match.id
            else:
                next_match.team2_id = winner_id
                next_match.team2_from_winners = False
                next_match.team2_winners_round = None
                next_match.team2_winners_match_number = None
                next_match.team2_losers_match_id = match.id

    db.commit()
    db.refresh(match)
    return match