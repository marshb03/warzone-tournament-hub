# app/utils/bracket_generator.py
from typing import List, Dict, Union
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from app.models.match import Match
from app.models.losers_match import LosersMatch
from app.models.team import Team
from app.models.tournament import Tournament, TournamentFormat
from .single_elimination_generator import (
    generate_first_round,
    handle_round_2,
    handle_subsequent_rounds,
    _get_next_power_of_two,
    _calculate_byes
)
from .double_elimination_generator import (
    generate_losers_bracket,
    update_losers_bracket,
    add_loser_to_bracket,
    calculate_losers_bracket_structure
)
from math import log2, ceil

def generate_bracket(tournament_id: int, teams: List[Team], db: Session):
    """Main bracket generation function that handles both formats."""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    num_teams = len(teams)
    if not 4 <= num_teams <= 32:
        raise HTTPException(status_code=400, detail="Number of teams must be between 4 and 32")

    # Clear any existing matches first
    db.query(Match).filter(Match.tournament_id == tournament_id).delete()
    db.query(LosersMatch).filter(LosersMatch.tournament_id == tournament_id).delete()
    db.commit()

    if tournament.format == TournamentFormat.SINGLE_ELIMINATION:
        # Single elimination logic remains the same
        matches_by_round = {}
        next_power = _get_next_power_of_two(num_teams)
        num_byes = next_power - num_teams
        bye_seeds = list(range(1, num_byes + 1))
        total_rounds = ceil(log2(next_power))
        
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
        
        return matches_by_round
    else:
         # Generate winners bracket (your existing code)
        winners_matches = {}
        next_power = _get_next_power_of_two(num_teams)
        num_byes = next_power - num_teams
        bye_seeds = list(range(1, num_byes + 1))
        total_rounds = ceil(log2(next_power))
        
        # Generate winners bracket matches
        winners_matches[1] = generate_first_round(tournament_id, teams, bye_seeds, db)
        
        for round_num in range(2, total_rounds + 1):
            if round_num == 2:
                winners_matches[2] = handle_round_2(tournament_id, bye_seeds, winners_matches[1], db)
            else:
                winners_matches[round_num] = handle_subsequent_rounds(
                    tournament_id,
                    winners_matches[round_num - 1],
                    round_num,
                    db
                )
        
        # Generate losers bracket
        losers_matches = generate_losers_bracket(tournament_id, num_teams, db)
        
        winners_matches =db.query(Match)\
            
        final_winners_match = db.query(Match)\
            .filter(
                Match.tournament_id == tournament_id,
                Match.round < 98  # Exclude championship rounds
            )\
            .order_by(Match.round.desc())\
            .first()

        # Create first championship match
        first_championship = Match(
            tournament_id=tournament_id,
            round=98,
            match_number=201,
            team1_id=None,
            team2_id=None
        )
        db.add(first_championship)
        db.flush()

        # Create second championship match
        second_championship = Match(
            tournament_id=tournament_id,
            round=99,
            match_number=201,
            team1_id=None,
            team2_id=None
        )
        db.add(second_championship)
        db.flush()

        # Link matches
        if final_winners_match:
            final_winners_match.next_match_id = first_championship.id
        first_championship.next_match_id = second_championship.id

        db.commit()

        return {
            "winners_bracket": winners_matches,
            "losers_bracket": losers_matches,
            "championship": [first_championship, second_championship]
        }
        
def update_bracket(match_id: int, winner_id: int, db: Session) -> Union[Match, LosersMatch]:
    """
    Update match winner and progress the tournament based on bracket type.
    """
    # First check if it's a winners bracket match
    match = db.query(Match).filter(Match.id == match_id).first()
    if match:
        # Get tournament format
        tournament = db.query(Tournament).filter(Tournament.id == match.tournament_id).first()
        
        # For double elimination, we need to handle the loser
        if tournament.format == TournamentFormat.DOUBLE_ELIMINATION:
            loser_id = match.team1_id if match.team1_id != winner_id else match.team2_id
            # Add loser to appropriate spot in losers bracket
            # Pass all required arguments including winners_match_num and db
            add_loser_to_bracket(
                tournament_id=tournament.id,
                loser_id=loser_id,
                winners_match_num=match.match_number,
                winners_round=match.round,
                db=db
            )
        
        # Continue with normal winners bracket update
        return update_single_elimination_match(match_id, winner_id, db)
    
    # If not found in winners bracket, check losers bracket
    losers_match = db.query(LosersMatch).filter(LosersMatch.id == match_id).first()
    if losers_match:
        return update_losers_bracket(match_id, winner_id, db)
    
    raise HTTPException(status_code=404, detail="Match not found")

def update_single_elimination_match(match_id: int, winner_id: int, db: Session) -> Match:
    """Update match result and handle progression."""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if winner_id not in [match.team1_id, match.team2_id]:
        raise HTTPException(status_code=400, detail="Winner must be one of the teams in the match")

    tournament = db.query(Tournament).filter(Tournament.id == match.tournament_id).first()

    # Set winner and loser
    match.winner_id = winner_id
    match.loser_id = match.team1_id if match.team1_id != winner_id else match.team2_id

    # For double elimination, handle loser progression
    if tournament.format == TournamentFormat.DOUBLE_ELIMINATION and match.round != 98 and match.round != 99:
        add_loser_to_bracket(tournament.id, match.loser_id, match.match_number, match.round, db)

    # Update next match if it exists
    if match.next_match_id:
        next_match = db.query(Match).filter(Match.id == match.next_match_id).first()
        
        # Handle championship matches specially
        if next_match and next_match.round in [98, 99]:
            if match.round == 98:  # First championship match
                if winner_id == match.team2_id:  # Losers bracket winner won
                    next_match.team1_id = match.team1_id  # Original winners bracket champion
                    next_match.team2_id = winner_id       # Losers bracket champion
                else:  # Winners bracket champion won
                    # No second match needed
                    next_match.team1_id = None
                    next_match.team2_id = None
            else:
                if not next_match.team1_id:
                    next_match.team1_id = winner_id
                else:
                    next_match.team2_id = winner_id
        else:
            # Normal match progression
            if not next_match.team1_id:
                next_match.team1_id = winner_id
            else:
                next_match.team2_id = winner_id
                # Maintain proper seeding
                if winner_id < next_match.team1_id:
                    next_match.team1_id, next_match.team2_id = next_match.team2_id, next_match.team1_id

    db.commit()
    db.refresh(match)
    return match