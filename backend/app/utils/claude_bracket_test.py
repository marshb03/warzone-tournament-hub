from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.match import Match
from app.models.team import Team
from math import log2, ceil
from fastapi import HTTPException

def _get_next_power_of_two(n: int) -> int:
    """Get the next power of 2 that's greater than or equal to n."""
    return 2 ** ceil(log2(n))

def _calculate_byes(num_teams: int) -> List[int]:
    """
    Calculate which teams get byes in the first round.
    Returns list of seed numbers that get byes.
    """
    next_power = _get_next_power_of_two(num_teams)
    num_byes = next_power - num_teams
    return list(range(1, num_byes + 1))

def generate_first_round(tournament_id: int, teams: List[Team], bye_seeds: List[int], db: Session) -> List[Match]:
    """
    Generate first round matches using seed-based pairing.
    """
    playing_seeds = [seed for seed in range(1, len(teams) + 1) if seed not in bye_seeds]
    matches = []
    
    # Create first round matches (highest vs lowest seeds)
    n = len(playing_seeds)
    for i in range(n // 2):
        high_seed = playing_seeds[i]
        low_seed = playing_seeds[-(i+1)]
        
        match = Match(
            tournament_id=tournament_id,
            round=1,
            match_number=i + 1,
            team1_id=high_seed,
            team2_id=low_seed
        )
        matches.append(match)
        db.add(match)
    
    return matches

def handle_round_2(tournament_id: int, bye_seeds: List[int], prev_round_matches: List[Match], db: Session) -> List[Match]:
    """
    Handle Round 2 matches, including bye teams and remaining matches.
    """
    round_2_matches = []
    match_number = 1
    num_byes = len(bye_seeds)
    
    # Calculate total matches needed for round 2
    # Total matches = (R1 matches + bye teams) / 2
    total_round_2_matches = (len(prev_round_matches) + num_byes) // 2
    
    # Sort previous round matches by match number (highest to lowest)
    prev_round_matches = sorted(prev_round_matches, key=lambda m: m.match_number, reverse=True)
    
    # 1. Create matches for bye teams first
    for seed in bye_seeds:
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=match_number,
            team1_id=seed
        )
        round_2_matches.append(match)
        db.add(match)
        match_number += 1
    
    # 2. Create remaining matches to reach total_round_2_matches
    while len(round_2_matches) < total_round_2_matches:
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=match_number
        )
        round_2_matches.append(match)
        db.add(match)
        match_number += 1
    
    db.flush()
    
    # 3. Link matches with bye teams
    for i in range(num_byes):
        if i < len(prev_round_matches):
            # Highest match numbers from R1 go against bye teams
            prev_round_matches[i].next_match_id = round_2_matches[i].id
    
    # 4. Handle remaining matches
    remaining_r1_matches = prev_round_matches[num_byes:]  # Skip matches already assigned to byes
    remaining_r2_matches = round_2_matches[num_byes:]    # Skip bye matches
    
    # Sort remaining R1 matches to ensure proper high-low pairing
    remaining_r1_matches = sorted(remaining_r1_matches, key=lambda m: m.match_number)
    
    for i in range(len(remaining_r2_matches)):
        current_match = remaining_r2_matches[i]
        if 2 * i < len(remaining_r1_matches):
            # Link lowest number with highest remaining number
            low_match = remaining_r1_matches[i]
            high_match = remaining_r1_matches[-(i+1)]
            
            low_match.next_match_id = current_match.id
            high_match.next_match_id = current_match.id
    
    return round_2_matches

def calculate_first_round_teams(num_teams: int) -> List[Tuple[int, int]]:
    """
    Calculate which teams need to play in Round 1 for any tournament size.
    Returns list of tuples (high_seed, low_seed) for Round 1 matches.
    """
    teams_over_16 = num_teams - 16  # How many teams need to be eliminated to get to 16
    num_r1_matches = teams_over_16 # Number of matches needed in Round 1
    
    # Calculate starting seed - count back from 16 based on how many matches we need
    start_seed = 16 - num_r1_matches + 1
    
    # Create pairs of teams that must play
    pairs = []
    for i in range(num_r1_matches):
        high_seed = start_seed + i
        low_seed = num_teams - i
        pairs.append((high_seed, low_seed))
    
    return pairs

def generate_first_round_over_16(tournament_id: int, teams: List[Team], num_teams: int, db: Session) -> List[Match]:
    """
    Generate first round matches for tournaments with more than 16 teams.
    Works for any number of teams from 17-32.
    """
    matches = []
    match_number = 1
    
    # Get team pairings for Round 1
    team_pairs = calculate_first_round_teams(num_teams)
    
    # Create matches based on pairings
    for high_seed, low_seed in team_pairs:
        match = Match(
            tournament_id=tournament_id,
            round=1,
            match_number=match_number,
            team1_id=high_seed,     # Higher seed as team1
            team2_id=low_seed       # Lower seed as team2
        )
        matches.append(match)
        db.add(match)
        match_number += 1
    
    return matches

def handle_round_2_over_16(tournament_id: int, prev_round_matches: List[Match], num_teams: int, db: Session) -> List[Match]:
    """
    Handle Round 2 for tournaments with more than 16 teams.
    For 24+ teams: Always creates 8 matches in Round 2
    """
    round_2_matches = []
    match_number = 1
    
    # Calculate byes and matches
    if num_teams <= 24:
        num_byes = num_teams - 16
        total_r2_matches = (16 - num_byes) // 2
    else:
        num_byes = 32 - num_teams
        total_r2_matches = 8  # Always 8 matches for 24+ teams
    
    # Calculate matches without byes
    matches_without_bye = total_r2_matches - num_byes
    # Calculate how many R1 matches we need for non-bye R2 matches
    top_matches_from_r1 = matches_without_bye * 2
    
    # Create matches for bye teams first
    for seed in range(1, num_byes + 1):
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=match_number,
            team1_id=seed  # Top seeds get byes
        )
        round_2_matches.append(match)
        db.add(match)
        match_number += 1
    
    # Create remaining matches for R1 winners
    while len(round_2_matches) < total_r2_matches:
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=match_number
        )
        round_2_matches.append(match)
        db.add(match)
        match_number += 1
    
    db.flush()
    
    # Handle matches without byes
    if matches_without_bye > 0 and num_teams >= 25:
        # Get the top matches from R1 that will feed into R2 non-bye matches
        r1_matches_for_r2 = sorted(prev_round_matches[:top_matches_from_r1], 
                                 key=lambda m: m.match_number)
        # Get the non-bye matches from R2
        r2_no_bye_matches = round_2_matches[num_byes:]
        
        # Link R1 matches to R2 (highest vs lowest pattern)
        for i in range(matches_without_bye):
            r2_match = r2_no_bye_matches[i]
            if 2 * i < len(r1_matches_for_r2):
                low_r1_matches_for_r2 = r1_matches_for_r2[i]
                high_r1_matches_for_r2 = r1_matches_for_r2[-(i+1)]
                
                # Link both matches to the same R2 match
                low_r1_matches_for_r2.next_match_id = r2_match.id
                high_r1_matches_for_r2.next_match_id = r2_match.id
    
    # Link remaining R1 matches to R2 bye matches
    remaining_r1 = sorted(prev_round_matches[top_matches_from_r1:], 
                         key=lambda m: m.match_number, reverse=True)
    bye_matches = round_2_matches[:num_byes]
    
    for i, r1_match in enumerate(remaining_r1):
        if i < len(bye_matches):
            r1_match.next_match_id = bye_matches[i].id
    
    return round_2_matches

def handle_subsequent_rounds(tournament_id: int, prev_round_matches: List[Match], round_num: int, db: Session) -> List[Match]:
    """
    Handle Round 3 and beyond using highest vs lowest pairing.
    """
    current_round_matches = []
    match_number = 1
    
    # Create all matches for this round
    num_matches = len(prev_round_matches) // 2
    for _ in range(num_matches):
        match = Match(
            tournament_id=tournament_id,
            round=round_num,
            match_number=match_number
        )
        current_round_matches.append(match)
        db.add(match)
        match_number += 1
    
    db.flush()
    
    # Sort previous round matches by match number
    prev_round_matches = sorted(prev_round_matches, key=lambda m: m.match_number)
    
    # Link matches (lowest vs highest)
    for i in range(len(current_round_matches)):
        current_match = current_round_matches[i]
        if 2 * i < len(prev_round_matches):
            # Link lowest with highest
            low_match = prev_round_matches[i]
            high_match = prev_round_matches[-(i+1)]
            
            low_match.next_match_id = current_match.id
            high_match.next_match_id = current_match.id
    
    return current_round_matches

def generate_bracket(tournament_id: int, teams: List[Team], db: Session):
    """
    Main bracket generation function with special handling for >16 teams.
    """
    num_teams = len(teams)
    if not 4 <= num_teams <= 32:
        raise HTTPException(status_code=400, detail="Number of teams must be between 4 and 32")

    matches_by_round = {}
    
    if num_teams <= 16:
        # Use existing logic for 16 or fewer teams
        next_power = _get_next_power_of_two(num_teams)
        num_byes = next_power - num_teams
        bye_seeds = list(range(1, num_byes + 1))
        total_rounds = ceil(log2(next_power))
        
        # Generate rounds using existing logic
        matches_by_round[1] = generate_first_round(tournament_id, teams, bye_seeds, db)
        
        for round_num in range(2, total_rounds + 1):
            if round_num == 2:
                matches_by_round[2] = handle_round_2(tournament_id, bye_seeds, matches_by_round[1], db)
            else:
                matches_by_round[round_num] = handle_subsequent_rounds(
                    tournament_id,
                    matches_by_round[round_num - 1],
                    round_num,
                    db
                )
    else:
        # Special handling for more than 16 teams
        total_rounds = ceil(log2(32))  # Will always be 5 rounds for 17-32 teams
        
        # Generate Round 1 (only for teams over 16)
        matches_by_round[1] = generate_first_round_over_16(tournament_id, teams, num_teams, db)
        
        # Generate Round 2 (one bye team, rest play their first matches)
        matches_by_round[2] = handle_round_2_over_16(tournament_id, matches_by_round[1], num_teams, db)
        
        # Generate remaining rounds using existing logic
        for round_num in range(3, total_rounds + 1):
            matches_by_round[round_num] = handle_subsequent_rounds(
                tournament_id,
                matches_by_round[round_num - 1],
                round_num,
                db
            )
    
    db.commit()
    return matches_by_round

def update_bracket(match_id: int, winner_id: int, db: Session) -> Match:
    """
    Update match winner and progress the tournament.
    """
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if winner_id not in [match.team1_id, match.team2_id]:
        raise HTTPException(status_code=400, detail="Winner must be one of the teams in the match")

    match.winner_id = winner_id

    # Update next match if it exists
    if match.next_match_id:
        next_match = db.query(Match).filter(Match.id == match.next_match_id).first()
        
        # Get all matches that feed into this next match
        sibling_matches = db.query(Match)\
            .filter(Match.next_match_id == next_match.id)\
            .order_by(Match.match_number)\
            .all()
            
        # Place winner based on which match had lower match_number
        is_from_lower_match = match.match_number < max(m.match_number for m in sibling_matches)
        
        if not next_match.team1_id:
            # First winner to advance goes to team1
            next_match.team1_id = winner_id
        else:
            # Second winner goes to team2
            next_match.team2_id = winner_id
            # If winner came from lower match number and is higher seed, swap positions
            if is_from_lower_match and winner_id < next_match.team1_id:
                next_match.team1_id, next_match.team2_id = next_match.team2_id, next_match.team1_id

    db.commit()
    db.refresh(match)
    return match