from typing import List, Dict
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
    
    # Calculate Round 1 matches
    if num_teams == 4:
        r1_matches = 2
    elif num_teams in [8, 16]:
        r1_matches = num_teams // 4
    elif num_teams == 32:
        r1_matches = 8
    elif num_teams in [5, 7, 9, 13, 17, 25]:
        r1_matches = 1
    elif num_teams in [6, 10, 14, 18, 26]:
        r1_matches = 2
    elif num_teams in [11, 15, 19, 27]:
        r1_matches = 3
    elif num_teams in [12, 20, 28]:
        r1_matches = 4
    elif num_teams in [21, 29]:
        r1_matches = 5
    elif num_teams in [22, 30]:
        r1_matches = 6
    elif num_teams in [23, 31]:
        r1_matches = 7
    else:  # num_teams == 24
        r1_matches = 8

    structure[1] = {
        'num_matches': r1_matches,
        'start_match_num': 101,
        'receives_losers_from': 1
    }

    # Calculate Round 2 matches
    if num_teams <= 6:
        r2_matches = 1
    elif num_teams <= 8:
        r2_matches = 2
    elif num_teams <= 12:
        r2_matches = 2
    elif num_teams <= 24:
        r2_matches = 4
    else:  # 25-32 teams
        r2_matches = 8

    structure[2] = {
        'num_matches': r2_matches,
        'start_match_num': 101,
        'receives_losers_from': 2
    }

    # Calculate Round 3 matches
    if num_teams == 4:
        # 4 teams only has 2 rounds
        return structure
    elif num_teams <= 8:
        r3_matches = 1
    elif num_teams <= 16:
        r3_matches = 2
    elif num_teams <= 32:
        r3_matches = 4

    structure[3] = {
        'num_matches': r3_matches,
        'start_match_num': 101,
        'receives_losers_from': 3
    }

    # Calculate Round 4 matches
    if num_teams <= 6:
        # 5-6 teams only has 3 rounds
        return structure
    elif num_teams == 7:
        structure[4] = {
            'num_matches': 1,
            'start_match_num': 101,
            'receives_losers_from': 4
        }
        return structure  # 7 teams stops at round 4
    
    # Continue with previous logic for 8+ teams...
    if num_teams <= 8:
        r4_matches = 1
    elif num_teams in [9, 10, 11, 12]:
        r4_matches = 1
    elif num_teams <= 16:
        r4_matches = 2
    elif num_teams <= 32:
        r4_matches = 4

    structure[4] = {
        'num_matches': r4_matches,
        'start_match_num': 101,
        'receives_losers_from': 4
    }

    # Calculate Round 5 matches only for 9+ teams
    if num_teams >= 9:
        if num_teams in [9, 10, 11, 12]:
            r5_matches = 1
        elif num_teams in [13, 14, 15, 16]:
            r5_matches = 1
        elif num_teams <= 32:
            r5_matches = 2

        structure[5] = {
            'num_matches': r5_matches,
            'start_match_num': 101,
            'receives_losers_from': 5
        }

    return structure

def generate_losers_bracket(tournament_id: int, num_teams: int, db: Session) -> List[LosersMatch]:
    """Generate complete losers bracket with all matches and links."""
    structure = calculate_losers_bracket_structure(num_teams)
    matches = []
    matches_by_round = {}

    # First pass: Create all matches (keep your existing code)
    for round_num in sorted(structure.keys()):
        round_matches = []
        round_info = structure[round_num]
        
        for i in range(round_info['num_matches']):
            match = LosersMatch(
                tournament_id=tournament_id,
                round=round_num,
                match_number=round_info['start_match_num'] + i,
                team1_id=None,
                team2_id=None,
                winner_id=None,
                next_match_id=None
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

def handle_power_2_teams(tournament_id: int, winners_match_num: int, winners_round: int, loser_id: int, db: Session) -> None:
    """
    Handle loser placement for tournaments with team counts that are powers of 2 (32, 16, 8, 4).
    
    Round 1 pattern:
    32 teams: 8 matches (M101-108)
    16 teams: 4 matches (M101-104)
    8 teams: 2 matches (M101-102)
    4 teams: 1 match (M101)
    
    For each size:
    - First half of matches go to team1 spots
    - Second half of matches go to team2 spots in reverse order
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
    """
    # Calculate tournament structure
    next_power = 2 ** ceil(log2(num_teams))
    num_byes = next_power - num_teams
    total_r1_matches = (num_teams - num_byes) // 2
    
    print(f"Debug - Total teams: {num_teams}, Next power: {next_power}, Byes: {num_byes}")
    
    if num_teams in [32, 16, 8, 4]:
        handle_power_2_teams(tournament_id, winners_match_num, winners_round, loser_id, db)
        
    elif 25 <= num_teams <= 31:
        handle_25_31_team_losers(tournament_id, winners_match_num, winners_round, loser_id, db)
    
    elif num_teams in [24, 12]:
        handle_24_12_team_losers(tournament_id, winners_match_num, winners_round, loser_id, db)
    
    elif 17 <= num_teams <= 23:
        handle_17_23_team_losers(tournament_id, winners_match_num, winners_round, loser_id, total_r1_matches, db)
    
    elif 13 <= num_teams <= 16:
        handle_13_16_team_losers(tournament_id, winners_match_num, winners_round, loser_id, db)
    
    elif 9 <= num_teams <= 11: 
        handle_9_11_team_losers(tournament_id, winners_match_num, winners_round, loser_id, db)
    
    elif 5 <= num_teams <= 7: 
        handle_5_7_team_losers(tournament_id, winners_match_num, winners_round, loser_id, db)
    
    else:
        raise ValueError(f"Invalid number of teams: {num_teams}. Must be between 4 and 32.")
    
    db.commit()
    
def update_losers_bracket(match_id: int, winner_id: int, db: Session) -> LosersMatch:
    """
    Handle updates for losers bracket matches.
    For Round 2 winners, pair lowest with highest match numbers for Round 3.
    """
    losers_match = db.query(LosersMatch).filter(LosersMatch.id == match_id).first()
    if not losers_match:
        raise HTTPException(status_code=404, detail="Losers bracket match not found")

    if winner_id not in [losers_match.team1_id, losers_match.team2_id]:
        raise HTTPException(status_code=400, detail="Winner must be one of the teams in the match")

    # Set winner in current match
    losers_match.winner_id = winner_id
    db.flush()

    # Handle progression
    if losers_match.next_match_id:
        next_match = db.query(LosersMatch).filter(LosersMatch.id == losers_match.next_match_id).first()
        if next_match:
            if losers_match.round == 2:
                # For round 2 winners, place based on match number (low vs high pairing)
                total_r2_matches = db.query(LosersMatch)\
                    .filter(
                        LosersMatch.tournament_id == losers_match.tournament_id,
                        LosersMatch.round == 2
                    ).count()
                
                # Lower match numbers go to team1_id, higher to team2_id
                if losers_match.match_number <= (100 + total_r2_matches // 2):
                    next_match.team1_id = winner_id
                else:
                    next_match.team2_id = winner_id
            else:
                # Normal progression for other rounds
                if not next_match.team1_id:
                    next_match.team1_id = winner_id
                else:
                    next_match.team2_id = winner_id

    db.commit()
    db.refresh(losers_match)
    return losers_match 