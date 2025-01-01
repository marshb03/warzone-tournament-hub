from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.match import Match
from app.models.team import Team
from app.models.losers_match import LosersMatch
from math import log2, ceil
from fastapi import HTTPException

def get_team_id_by_seed(db: Session, tournament_id: int, seed: int) -> int:
    """Get team ID from a tournament by their seed number."""
    team = db.query(Team)\
        .filter(
            Team.tournament_id == tournament_id,
            Team.seed == seed
        ).first()
    return team.id if team else None

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

def generate_first_round_small_tournament(tournament_id: int, teams: List[Team], num_teams: int, db: Session) -> List[Match]:
    """
    Generate first round matches for tournaments with 4-11 teams using mathematical patterns.
    """
    matches = []
    match_number = 1
    
    # Calculate how many teams need to play in R1 (teams beyond highest power of 2)
    next_power = _get_next_power_of_two(num_teams)
    teams_playing = (num_teams - (next_power // 2)) * 2  # Number of teams that play in R1
    num_r1_matches = teams_playing // 2
    
    # Calculate starting seed for R1 matches
    start_seed = num_teams - teams_playing + 1
    
    # Create R1 matches pairing highest vs lowest seeds
    for i in range(num_r1_matches):
        high_seed = start_seed + i
        low_seed = num_teams - i
        
        high_seed_team = db.query(Team)\
            .filter(Team.tournament_id == tournament_id, Team.seed == high_seed)\
            .first()
        low_seed_team = db.query(Team)\
            .filter(Team.tournament_id == tournament_id, Team.seed == low_seed)\
            .first()
        
        match = Match(
            tournament_id=tournament_id,
            round=1,
            match_number=match_number,
            team1_id=high_seed_team.id,
            team2_id=low_seed_team.id
        )
        matches.append(match)
        db.add(match)
        match_number += 1
    
    return matches

def handle_round_2_small_tournament(tournament_id: int, prev_round_matches: List[Match], num_teams: int, db: Session) -> List[Match]:
    """
    Handle Round 2 matches with individual handling for each tournament size.
    """
    round_2_matches = []
    
    if num_teams == 11:
        # Match 1: Seed 1 bye
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=1,
            team1_id=get_team_id_by_seed(db, tournament_id, 1)
        )
        round_2_matches.append(match)
        db.add(match)
        
        # Match 2: Seed 2 bye
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=2,
            team1_id=get_team_id_by_seed(db, tournament_id, 2)
        )
        round_2_matches.append(match)
        db.add(match)
        
        # Match 3: Seed 3 bye
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=3,
            team1_id=get_team_id_by_seed(db, tournament_id, 3)
        )
        round_2_matches.append(match)
        db.add(match)
        
        # Match 4: 4v5 only
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=4,
            team1_id=get_team_id_by_seed(db, tournament_id, 4),
            team2_id=get_team_id_by_seed(db, tournament_id, 5)
        )
        round_2_matches.append(match)
        db.add(match)
        
    elif num_teams == 10:
        # Match 1: Seed 1 bye
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=1,
            team1_id=get_team_id_by_seed(db, tournament_id, 1)
        )
        round_2_matches.append(match)
        db.add(match)
        
        # Match 2: Seed 2 bye
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=2,
            team1_id=get_team_id_by_seed(db, tournament_id, 2)
        )
        round_2_matches.append(match)
        db.add(match)
        
        # Match 3: 3v6
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=3,
            team1_id=get_team_id_by_seed(db, tournament_id, 3),
            team2_id=get_team_id_by_seed(db, tournament_id, 6)
        )
        round_2_matches.append(match)
        db.add(match)
        
        # Match 4: 4v5
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=4,
            team1_id=get_team_id_by_seed(db, tournament_id, 4),
            team2_id=get_team_id_by_seed(db, tournament_id, 5)
        )
        round_2_matches.append(match)
        db.add(match)
        
    elif num_teams == 9:
        # Match 1: Seed 1 bye
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=1,
            team1_id=get_team_id_by_seed(db, tournament_id, 1)
        )
        round_2_matches.append(match)
        db.add(match)
        
        # Match 2: 2v7
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=2,
            team1_id=get_team_id_by_seed(db, tournament_id, 2),
            team2_id=get_team_id_by_seed(db, tournament_id, 7)
        )
        round_2_matches.append(match)
        db.add(match)
        
        # Match 3: 3v6
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=3,
            team1_id=get_team_id_by_seed(db, tournament_id, 3),
            team2_id=get_team_id_by_seed(db, tournament_id, 6)
        )
        round_2_matches.append(match)
        db.add(match)
        
        # Match 4: 4v5
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=4,
            team1_id=get_team_id_by_seed(db, tournament_id, 4),
            team2_id=get_team_id_by_seed(db, tournament_id, 5)
        )
        round_2_matches.append(match)
        db.add(match)
        
    elif num_teams == 8:
        # Create 2 matches for Round 2 winners
        for i in range(2):
            match = Match(
                tournament_id=tournament_id,
                round=2,
                match_number=i + 1
            )
            round_2_matches.append(match)
            db.add(match)
            
        db.flush()
        
        # Sort R1 matches by match number
        prev_round_matches = sorted(prev_round_matches, key=lambda m: m.match_number)
        
        # Link matches in correct pairs:
        # R2M1: Winner of R1M1 vs Winner of R1M4
        prev_round_matches[0].next_match_id = round_2_matches[0].id  # R1M1 winner
        prev_round_matches[3].next_match_id = round_2_matches[0].id  # R1M4 winner
        
        # R2M2: Winner of R1M2 vs Winner of R1M3
        prev_round_matches[1].next_match_id = round_2_matches[1].id  # R1M2 winner
        prev_round_matches[2].next_match_id = round_2_matches[1].id  # R1M3 winner
            
    elif num_teams == 7:
        # Match 1: Seed 1 bye for R1M3 winner
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=1,
            team1_id=get_team_id_by_seed(db, tournament_id, 1)
        )
        round_2_matches.append(match)
        db.add(match)
        
        # Match 2: Empty for R1M1 vs R1M2 winners
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=2
        )
        round_2_matches.append(match)
        db.add(match)
        
    elif num_teams == 6:
        # Match 1: Seed 1 bye
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=1,
            team1_id=get_team_id_by_seed(db, tournament_id, 1)
        )
        round_2_matches.append(match)
        db.add(match)
        
        # Match 2: Seed 2 bye
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=2,
            team1_id=get_team_id_by_seed(db, tournament_id, 2)
        )
        round_2_matches.append(match)
        db.add(match)
            
    elif num_teams == 5:
        # Match 1: Seed 1 bye for R1 winner
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=1,
            team1_id=get_team_id_by_seed(db, tournament_id, 1)
        )
        round_2_matches.append(match)
        db.add(match)
        
        # Match 2: 2v3
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=2,
            team1_id=get_team_id_by_seed(db, tournament_id, 2),
            team2_id=get_team_id_by_seed(db, tournament_id, 3)
        )
        round_2_matches.append(match)
        db.add(match)
        
    elif num_teams == 4:
        # Create 1 match for Round 2 winners
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=1
        )
        round_2_matches.append(match)
        db.add(match)
    
    db.flush()
    
    # Link R1 winners to appropriate R2 matches
    if prev_round_matches:
        prev_round_matches = sorted(prev_round_matches, key=lambda m: m.match_number, reverse=True)
        available_r2_matches = [m for m in round_2_matches if not m.team2_id]
        available_r2_matches = sorted(available_r2_matches, key=lambda m: m.match_number)
        
        if num_teams == 7:
            # Special handling for 7 teams
            # R1M3 winner goes to first match with seed 1
            prev_round_matches[0].next_match_id = round_2_matches[0].id
            # R1M1 and R1M2 winners go to second match
            prev_round_matches[2].next_match_id = round_2_matches[1].id
            prev_round_matches[1].next_match_id = round_2_matches[1].id
        else:
            # Standard linking for other sizes
            for i, r1_match in enumerate(prev_round_matches):
                if i < len(available_r2_matches):
                    r1_match.next_match_id = available_r2_matches[i].id
    
    db.commit()
    return round_2_matches

    '''
    # Link R1 matches to R2
    if prev_round_matches:
        prev_round_matches = sorted(prev_round_matches, key=lambda m: m.match_number, reverse=True)
        available_r2_matches = [m for m in round_2_matches if not m.team2_id]
        available_r2_matches = sorted(available_r2_matches, key=lambda m: m.match_number)
        
        for i, r1_match in enumerate(prev_round_matches):
            if i < len(available_r2_matches):
                r1_match.next_match_id = available_r2_matches[i].id
    
    db.commit()
    return round_2_matches
'''

def generate_first_round(tournament_id: int, teams: List[Team], bye_seeds: List[int], db: Session) -> List[Match]:
    """Generate first round matches using seed-based pairing."""
    playing_seeds = [seed for seed in range(1, len(teams) + 1) if seed not in bye_seeds]
    matches = []
    
    # Create first round matches (highest vs lowest seeds)
    n = len(playing_seeds)
    for i in range(n // 2):
        high_seed = playing_seeds[i]
        low_seed = playing_seeds[-(i+1)]
        
        # Get team IDs by their seeds
        high_seed_team = db.query(Team)\
            .filter(Team.tournament_id == tournament_id, Team.seed == high_seed)\
            .first()
        low_seed_team = db.query(Team)\
            .filter(Team.tournament_id == tournament_id, Team.seed == low_seed)\
            .first()
        
        match = Match(
            tournament_id=tournament_id,
            round=1,
            match_number=i + 1,
            team1_id=high_seed_team.id,  # Use team ID, not seed
            team2_id=low_seed_team.id    # Use team ID, not seed
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
    total_round_2_matches = (len(prev_round_matches) + num_byes) // 2
    
    # Sort previous round matches by match number (highest to lowest)
    prev_round_matches = sorted(prev_round_matches, key=lambda m: m.match_number, reverse=True)
    
    # 1. Create matches for bye teams first
    for seed in bye_seeds:
        # Get actual team ID for the bye seed
        team_id = get_team_id_by_seed(db, tournament_id, seed)
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=match_number,
            team1_id=team_id  # Now using actual team ID
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
            prev_round_matches[i].next_match_id = round_2_matches[i].id
    
    # 4. Handle remaining matches
    remaining_r1_matches = prev_round_matches[num_byes:]
    remaining_r2_matches = round_2_matches[num_byes:]
    
    remaining_r1_matches = sorted(remaining_r1_matches, key=lambda m: m.match_number)
    
    for i in range(len(remaining_r2_matches)):
        current_match = remaining_r2_matches[i]
        if 2 * i < len(remaining_r1_matches):
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
        # Get actual team IDs for both seeds
        high_seed_id = get_team_id_by_seed(db, tournament_id, high_seed)
        low_seed_id = get_team_id_by_seed(db, tournament_id, low_seed)
        
        match = Match(
            tournament_id=tournament_id,
            round=1,
            match_number=match_number,
            team1_id=high_seed_id,     # Now using actual team IDs
            team2_id=low_seed_id
        )
        matches.append(match)
        db.add(match)
        match_number += 1
    
    return matches

def handle_round_2_16_to_23_teams(tournament_id: int, prev_round_matches: List[Match], num_teams: int, db: Session) -> List[Match]:
    """
    Handle Round 2 for tournaments with 16-23 teams.
    Always creates exactly 8 matches in Round 2.
    """
    round_2_matches = []
    match_number = 1
    total_r2_matches = 8
    
    # Calculate byes
    num_byes = num_teams - 16
    
    # Create matches for bye teams first
    for seed in range(1, num_byes + 1):
        # Get actual team ID for the bye seed
        team_id = get_team_id_by_seed(db, tournament_id, seed)
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=match_number,
            team1_id=team_id  # Now using actual team ID
        )
        round_2_matches.append(match)
        db.add(match)
        match_number += 1
    
    # Calculate teams needed for remaining R2 matches
    remaining_matches_needed = total_r2_matches - num_byes
    teams_needed_for_r2_matches = remaining_matches_needed * 2
    
    # Get the next set of top seeds after byes
    start_seed = num_byes + 1
    top_remaining_seeds = list(range(start_seed, start_seed + teams_needed_for_r2_matches))
    
    # Pair these teams (highest vs lowest)
    for i in range(remaining_matches_needed):
        high_seed = top_remaining_seeds[i]
        low_seed = top_remaining_seeds[-(i + 1)]
        
        # Get actual team IDs for both seeds
        high_seed_id = get_team_id_by_seed(db, tournament_id, high_seed)
        low_seed_id = get_team_id_by_seed(db, tournament_id, low_seed)
        
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=match_number,
            team1_id=high_seed_id,
            team2_id=low_seed_id
        )
        round_2_matches.append(match)
        db.add(match)
        match_number += 1
    
    db.flush()
    
    # Link Round 1 matches to Round 2
    prev_round_matches = sorted(prev_round_matches, key=lambda m: m.match_number, reverse=True)
    round_2_matches = sorted(round_2_matches, key=lambda m: m.match_number)
    
    for i, r1_match in enumerate(prev_round_matches):
        if i < len(round_2_matches):
            r1_match.next_match_id = round_2_matches[i].id
    
    return round_2_matches

def handle_round_2_24_plus_teams(tournament_id: int, prev_round_matches: List[Match], num_teams: int, db: Session) -> List[Match]:
    """
    Handle Round 2 for tournaments with 24+ teams.
    Always has 8 matches, with varying numbers of byes.
    """
    round_2_matches = []
    match_number = 1

    # Calculate byes
    num_byes = 32 - num_teams
    total_r2_matches = 8

    # Calculate matches without byes and required R1 matches
    matches_without_bye = total_r2_matches - num_byes
    top_matches_from_r1 = matches_without_bye * 2

    # Create bye matches
    for seed in range(1, num_byes + 1):

        team_id = get_team_id_by_seed(db, tournament_id, seed)
        match = Match(
            tournament_id=tournament_id,
            round=2,
            match_number=match_number,
            team1_id=team_id
        )
        round_2_matches.append(match)
        db.add(match)
        match_number += 1

    # Create non-bye matches
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

    # Handle matches without byes first
    r1_matches_for_r2 = sorted(prev_round_matches[:top_matches_from_r1], 
                             key=lambda m: m.match_number)
    r2_no_bye_matches = round_2_matches[num_byes:]

    # Link R1 matches to R2 (highest vs lowest pattern)
    for i in range(matches_without_bye):
        r2_match = r2_no_bye_matches[i]
        if 2 * i < len(r1_matches_for_r2):
            low_r1_match = r1_matches_for_r2[i]
            high_r1_match = r1_matches_for_r2[-(i+1)]

            low_r1_match.next_match_id = r2_match.id
            high_r1_match.next_match_id = r2_match.id

    # Handle remaining matches with byes
    remaining_r1 = sorted(prev_round_matches[top_matches_from_r1:], 
                         key=lambda m: m.match_number, reverse=True)
    bye_matches = round_2_matches[:num_byes]

    for i, r1_match in enumerate(remaining_r1):
        if i < len(bye_matches):
            r1_match.next_match_id = bye_matches[i].id

    return round_2_matches

def handle_round_2_over_16(tournament_id: int, prev_round_matches: List[Match], num_teams: int, db: Session) -> List[Match]:
    """
    Main handler that delegates to appropriate function based on number of teams.
    """
    if 16 <= num_teams <= 23:
        return handle_round_2_16_to_23_teams(tournament_id, prev_round_matches, num_teams, db)
    else:
        return handle_round_2_24_plus_teams(tournament_id, prev_round_matches, num_teams, db)

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
    Main bracket generation function that handles all tournament sizes.
    Ensures only one handler is used based on tournament size.
    """
    num_teams = len(teams)
    if not 4 <= num_teams <= 32:
        raise HTTPException(status_code=400, detail="Number of teams must be between 4 and 32")

    # Clear any existing matches first to prevent conflicts
    db.query(Match).filter(Match.tournament_id == tournament_id).delete()
    db.query(LosersMatch).filter(LosersMatch.tournament_id == tournament_id).delete()
    db.commit()

    matches_by_round = {}
    
    # Explicitly separate the logic paths with no overlap
    if 4 <= num_teams <= 11:
        print(f"Using small tournament logic for {num_teams} teams")  # Debug log
        # Small tournament specific logic
        matches_by_round[1] = generate_first_round_small_tournament(tournament_id, teams, num_teams, db)
        matches_by_round[2] = handle_round_2_small_tournament(tournament_id, matches_by_round[1], num_teams, db)
        
        total_rounds = ceil(log2(_get_next_power_of_two(num_teams)))
        for round_num in range(3, total_rounds + 1):
            matches_by_round[round_num] = handle_subsequent_rounds(
                tournament_id,
                matches_by_round[round_num - 1],
                round_num,
                db
            )
    
    elif 12 <= num_teams <= 16:
        print(f"Using standard logic for {num_teams} teams")  # Debug log
        # Standard logic for 12-16 teams
        next_power = _get_next_power_of_two(num_teams)
        num_byes = next_power - num_teams
        bye_seeds = list(range(1, num_byes + 1))
        total_rounds = ceil(log2(next_power))
        
        matches_by_round[1] = generate_first_round(tournament_id, teams, bye_seeds, db)
        matches_by_round[2] = handle_round_2(tournament_id, bye_seeds, matches_by_round[1], db)
        
        for round_num in range(3, total_rounds + 1):
            matches_by_round[round_num] = handle_subsequent_rounds(
                tournament_id,
                matches_by_round[round_num - 1],
                round_num,
                db
            )
    
    else:  # 17-32 teams
        print(f"Using over-16 logic for {num_teams} teams")  # Debug log
        # Over 16 teams logic
        total_rounds = ceil(log2(32))
        
        matches_by_round[1] = generate_first_round_over_16(tournament_id, teams, num_teams, db)
        matches_by_round[2] = handle_round_2_over_16(tournament_id, matches_by_round[1], num_teams, db)
        
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