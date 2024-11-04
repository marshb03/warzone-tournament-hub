from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.losers_match import LosersMatch
from app.models.match import Match
from app.models.team import Team
from math import log2, ceil, floor
from fastapi import HTTPException
import logging

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
    if num_teams <= 8:
        r3_matches = 1
    elif num_teams <= 16:
        r3_matches = 2
    elif num_teams <= 32:
        r3_matches = 4


    if r3_matches > 0:
        structure[3] = {
            'num_matches': r3_matches,
            'start_match_num': 101,
            'receives_losers_from': 3
        }

    # Calculate subsequent rounds
    current_matches = r3_matches
    round_num = 4

    while current_matches >= 1:
        if num_teams <= 8:
            if round_num == 4:
                current_matches = 1
            else:
                break
        elif num_teams <= 12:
            if round_num == 4:
                current_matches = 1
            elif round_num == 5:
                current_matches = 1
            else:
                break
        elif num_teams <= 24:
            if round_num == 4:
                current_matches = 2
            elif round_num == 5:
                current_matches = 2
            elif round_num == 6:
                current_matches = 1
            elif round_num == 7:
                current_matches = 1
            else:
                break
        else:  # 25-32 teams
            if round_num == 4:
                current_matches = 4
            elif round_num == 5:
                current_matches = 2
            elif round_num == 6:
                current_matches = 2
            elif round_num == 7:
                current_matches = 1
            elif round_num == 8:
                current_matches = 1
            else:
                break

        structure[round_num] = {
            'num_matches': current_matches,
            'start_match_num': 101,
            'receives_losers_from': round_num
        }
        round_num += 1

    return structure

def generate_losers_bracket(tournament_id: int, num_teams: int, db: Session) -> List[LosersMatch]:
    """
    Generate complete losers bracket with all matches and links.
    - Round 1 winners -> Round 2 (same match number, face winners bracket losers)
    - Odd rounds: Winners progress to same match number to face winners bracket losers
    - Even rounds: Pair lowest vs highest match numbers from previous round
    """
    structure = calculate_losers_bracket_structure(num_teams)
    matches = []
    matches_by_round = {}

    # First pass: Create all matches
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
            
            if round_num % 2 == 0:  # Even rounds (2, 4, 6, 8)
                # Pair lowest with highest match numbers
                for i in range(len(current_matches) // 2):
                    low_match = current_matches[i]
                    high_match = current_matches[-(i + 1)]
                    if i < len(next_round_matches):
                        next_match = next_round_matches[i]
                        low_match.next_match_id = next_match.id
                        high_match.next_match_id = next_match.id
            else:  # Odd rounds (1, 3, 5, 7)
                # Winners progress to same match number in next round
                for curr_match in current_matches:
                    next_match = next((m for m in next_round_matches 
                                     if m.match_number == curr_match.match_number), None)
                    if next_match:
                        curr_match.next_match_id = next_match.id

    db.commit()
    return matches

def add_loser_to_bracket(tournament_id: int, loser_id: int, winners_match_num: int, winners_round: int, db: Session) -> None:
    """
    Place team that lost in winners bracket into appropriate losers match.
    Round 1: Pairs losers from winners bracket round 1 (lowest vs highest match numbers)
    Round 2: Winners bracket round 2 losers face winners from losers round 1
    Odd Rounds (3,5,7): Losers go to matching round in losers bracket
    """
    if winners_round == 1:
        # Handle Round 1 losers - pair lowest with highest match numbers
        total_r1_matches = db.query(Match)\
            .filter(
                Match.tournament_id == tournament_id,
                Match.round == 1
            )\
            .count()
        
        if winners_match_num <= total_r1_matches // 2:
            corresponding_match = total_r1_matches - winners_match_num + 1
            losers_match_num = 100 + winners_match_num
        else:
            corresponding_match = total_r1_matches - winners_match_num + 1
            losers_match_num = 100 + corresponding_match

        losers_match = db.query(LosersMatch)\
            .filter(
                LosersMatch.tournament_id == tournament_id,
                LosersMatch.round == 1,
                LosersMatch.match_number == losers_match_num
            ).first()
        
        if losers_match:
            if winners_match_num <= total_r1_matches // 2:
                losers_match.team1_id = loser_id
            else:
                losers_match.team2_id = loser_id
            
    elif winners_round == 2:
        # Handle Round 2 losers - they go against winners from losers round 1
        total_r2_matches = db.query(Match)\
            .filter(
                Match.tournament_id == tournament_id,
                Match.round == 2
            )\
            .count()
        
        # Inverse the match number (highest winners match goes to lowest losers match)
        losers_match_num = 101 + (total_r2_matches - winners_match_num)
        
        losers_match = db.query(LosersMatch)\
            .filter(
                LosersMatch.tournament_id == tournament_id,
                LosersMatch.round == 2,
                LosersMatch.match_number == losers_match_num
            ).first()
        
        if losers_match:
            # R2 losers always go to team2_id position
            losers_match.team2_id = loser_id
            
    else:
        # Map winners rounds to corresponding losers rounds
        losers_round_map = {
            3: 4,  # Winners R3 losers go to Losers R4
            4: 6,  # Winners R4 losers go to Losers R6
            5: 8   # Winners R5 losers go to Losers R8
        }
        
        target_losers_round = losers_round_map.get(winners_round)
        if target_losers_round:
            total_matches = db.query(Match)\
                .filter(
                    Match.tournament_id == tournament_id,
                    Match.round == winners_round
                )\
                .count()
            
            # Inverse the match number (highest winners match goes to lowest losers match)
            losers_match_num = 101 + (total_matches - winners_match_num)
            
            losers_match = db.query(LosersMatch)\
                .filter(
                    LosersMatch.tournament_id == tournament_id,
                    LosersMatch.round == target_losers_round,
                    LosersMatch.match_number == losers_match_num
                ).first()
            
            if losers_match:
                losers_match.team2_id = loser_id

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