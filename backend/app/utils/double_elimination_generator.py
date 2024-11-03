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
    elif num_teams <= 12:
        r3_matches = 2
    else:  # 13-32 teams
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
                current_matches = 1
            elif round_num == 6:
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
    Handles tournament sizes from 4-32 teams.
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

    # Ensure all matches are created first
    db.flush()

    # Second pass: Link matches between rounds
    for round_num in range(1, max(structure.keys())):
        current_matches = matches_by_round[round_num]
        if round_num + 1 in matches_by_round:
            next_matches = matches_by_round[round_num + 1]

            if round_num == 1:
                # First round matches pair up in next round
                for i in range(0, len(current_matches), 2):
                    if i // 2 < len(next_matches):
                        next_match = next_matches[i // 2]
                        if i < len(current_matches):
                            current_matches[i].next_match_id = next_match.id
                        if i + 1 < len(current_matches):
                            current_matches[i + 1].next_match_id = next_match.id
            else:
                # For subsequent rounds, winners progress sequentially
                for i in range(len(current_matches)):
                    if i // 2 < len(next_matches):
                        current_matches[i].next_match_id = next_matches[i // 2].id

    # Create linking metadata
    for round_num, round_info in structure.items():
        round_matches = matches_by_round[round_num]
        for match in round_matches:
            match.receives_losers_from = round_info['receives_losers_from']

    # Final commit
    db.commit()

    # Return all matches
    return matches

def add_loser_to_bracket(tournament_id: int, loser_id: int, winners_match_num: int, winners_round: int, db: Session) -> None:
    """
    Place team that lost in winners bracket into appropriate losers match.
    Implements crossing pattern for first round and proper placement for subsequent rounds.
    """
    # Get total number of teams in tournament to determine structure
    total_teams = db.query(Team).filter(Team.tournament_id == tournament_id).count()
    structure = calculate_losers_bracket_structure(total_teams)
    
    if winners_round == 1:
        # Handle Round 1 losers with crossing pattern
        total_r1_matches = db.query(Match)\
            .filter(
                Match.tournament_id == tournament_id,
                Match.round == 1
            )\
            .count()
            
        # Calculate which losers match to place the team in
        if total_r1_matches == 4:  # 8 teams
            # Implement 1-4, 2-3 crossing pattern
            if winners_match_num in [1, 4]:
                losers_match_num = 101  # First and fourth go to first match
            else:  # winners_match_num in [2, 3]
                losers_match_num = 102  # Second and third go to second match
        else:
            # For other tournament sizes, calculate based on structure
            matches_per_group = total_r1_matches // structure[1]['num_matches']
            group_num = (winners_match_num - 1) // matches_per_group
            losers_match_num = 101 + group_num
        
        # Find the appropriate losers match
        losers_match = db.query(LosersMatch)\
            .filter(
                LosersMatch.tournament_id == tournament_id,
                LosersMatch.round == 1,
                LosersMatch.match_number == losers_match_num
            ).first()
            
        if losers_match:
            # Place team in first available position
            if losers_match.team1_id is None:
                losers_match.team1_id = loser_id
            else:
                losers_match.team2_id = loser_id
            db.flush()
    
    else:  # Handle losers from Round 2 and beyond
        target_round = 2
        
        # For semifinals and finals losers, they go to specific later rounds
        if winners_round >= 3:
            # Find the appropriate round based on tournament size
            for round_num, round_info in structure.items():
                if round_info['receives_losers_from'] == winners_round:
                    target_round = round_num
                    break
        
        # Calculate which match in the target round should receive this loser
        match_index = (winners_match_num - 1) % structure[target_round]['num_matches']
        losers_match_num = 101 + match_index
        
        losers_match = db.query(LosersMatch)\
            .filter(
                LosersMatch.tournament_id == tournament_id,
                LosersMatch.round == target_round,
                LosersMatch.match_number == losers_match_num
            ).first()
        
        if losers_match:
            # For rounds after the first, losers from winners bracket always go to team2_id
            # This ensures they face the winner coming up through the losers bracket
            losers_match.team2_id = loser_id
            db.flush()

    # Commit changes
    db.commit()
    
def update_losers_bracket(match_id: int, winner_id: int, db: Session) -> LosersMatch:
    """
    Handle updates for losers bracket matches.
    Manages progression through the bracket and into championship matches.
    """
    losers_match = db.query(LosersMatch).filter(LosersMatch.id == match_id).first()
    if not losers_match:
        raise HTTPException(status_code=404, detail="Losers bracket match not found")

    if winner_id not in [losers_match.team1_id, losers_match.team2_id]:
        raise HTTPException(status_code=400, detail="Winner must be one of the teams in the match")

    # Set winner in current match
    losers_match.winner_id = winner_id
    db.flush()

    # Get tournament info for structure calculation
    total_teams = db.query(Team)\
        .filter(Team.tournament_id == losers_match.tournament_id)\
        .count()
    structure = calculate_losers_bracket_structure(total_teams)
    
    # Get the maximum round number for this tournament size
    max_round = max(structure.keys())

    # Check if this is the final losers bracket match
    if losers_match.round == max_round and losers_match.match_number == 101:
        # Find and update the championship match
        championship_match = db.query(Match)\
            .filter(
                Match.tournament_id == losers_match.tournament_id,
                Match.round == 98,
                Match.match_number == 201
            ).first()
            
        if championship_match:
            championship_match.team2_id = winner_id
            db.flush()
    else:
        # Normal progression logic
        if losers_match.next_match_id:
            next_match = db.query(LosersMatch)\
                .filter(LosersMatch.id == losers_match.next_match_id)\
                .first()
                
            if next_match:
                # For first round matches, winners go to team1_id positions
                if losers_match.round == 1:
                    next_match.team1_id = winner_id
                else:
                    # For other rounds, place winner in first available position
                    if next_match.team1_id is None:
                        next_match.team1_id = winner_id
                    else:
                        next_match.team2_id = winner_id
                        
                db.flush()

    # Commit all changes
    try:
        db.commit()
        db.refresh(losers_match)
        return losers_match
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))    