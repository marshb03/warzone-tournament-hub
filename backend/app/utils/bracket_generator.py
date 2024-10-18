# app/utils/bracket_generator.py
import math
from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.tournament import Tournament, Team, Match

def generate_bracket(tournament_id: int, teams: List[Team], db: Session) -> List[Match]:
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise ValueError("Tournament not found")

    num_teams = len(teams)
    if num_teams < 2:
        raise ValueError("At least 2 teams are required for a tournament")

    # Calculate the number of rounds
    num_rounds = math.ceil(math.log2(num_teams))
    
    # Calculate the number of byes
    num_byes = 2**num_rounds - num_teams

    matches = []
    round_num = 1

    # Create first round matches
    for i in range(0, num_teams - num_byes, 2):
        match = Match(
            tournament_id=tournament_id,
            round=round_num,
            match_number=len(matches) + 1
        )
        match.teams.extend([teams[i], teams[i+1]])
        matches.append(match)

    # Add byes
    for i in range(num_teams - num_byes, num_teams):
        match = Match(
            tournament_id=tournament_id,
            round=round_num,
            match_number=len(matches) + 1
        )
        match.teams.append(teams[i])
        matches.append(match)

    # Create subsequent round matches
    for round in range(2, num_rounds + 1):
        num_matches = 2**(num_rounds - round)
        for i in range(num_matches):
            match = Match(
                tournament_id=tournament_id,
                round=round,
                match_number=len(matches) + 1
            )
            matches.append(match)

    # Save matches to database
    db.add_all(matches)
    db.commit()

    return matches

def get_next_match(current_match: Match, db: Session) -> Match:
    next_round = current_match.round + 1
    next_match_number = (current_match.match_number + 1) // 2
    return db.query(Match).filter(
        Match.tournament_id == current_match.tournament_id,
        Match.round == next_round,
        Match.match_number == next_match_number
    ).first()

def update_bracket(match_id: int, winner_id: int, db: Session):
    current_match = db.query(Match).filter(Match.id == match_id).first()
    if not current_match:
        raise ValueError("Match not found")

    current_match.winner_id = winner_id
    db.commit()

    next_match = get_next_match(current_match, db)
    if next_match:
        next_match.teams.append(db.query(Team).filter(Team.id == winner_id).first())
        db.commit()

    return current_match