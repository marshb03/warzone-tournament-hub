# app/utils/double_elimination_generator.py
'''
from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.losers_match import LosersMatch
from app.models.match import Match
from app.models.team import Team
from math import log2, ceil
from fastapi import HTTPException
import logging
import os

log_file = os.path.join(os.getcwd(), 'tournament_debug.log')
logging.basicConfig(
    filename=log_file,
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def calculate_losers_bracket_structure(num_teams: int) -> Dict[int, int]:
    """Calculate number of matches needed per round in losers bracket."""
    structure = {}
    
    # First round - matches between R1 losers
    r1_matches = num_teams // 4  # For 8 teams = 2 matches
    structure[1] = r1_matches
    structure[2] = r1_matches
    structure[3] = r1_matches // 2
    structure[4] = 1
    
    return structure

def generate_losers_bracket(tournament_id: int, num_teams: int, db: Session) -> List[LosersMatch]:
    """Generate complete losers bracket with all matches and links."""
    structure = calculate_losers_bracket_structure(num_teams)
    matches = []
    matches_by_round = {}

    # First pass: Create all matches
    for round_num in sorted(structure.keys()):
        round_matches = []
        for i in range(structure[round_num]):
            match = LosersMatch(
                tournament_id=tournament_id,
                round=round_num,
                match_number=101 + i,
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

    # Second pass: Link matches
    for round_num in range(1, max(structure.keys())):
        current_matches = matches_by_round[round_num]
        next_matches = matches_by_round[round_num + 1]

        # For first round matches
        if round_num == 1:
            for i, current_match in enumerate(current_matches):
                if i < len(next_matches):
                    # Each match in round 1 goes to corresponding match in round 2
                    current_match.next_match_id = next_matches[i].id
        else:
            # For subsequent rounds, pair winners appropriately
            for i in range(0, len(current_matches), 2):
                if i // 2 < len(next_matches):
                    next_match = next_matches[i // 2]
                    current_matches[i].next_match_id = next_match.id
                    if i + 1 < len(current_matches):
                        current_matches[i + 1].next_match_id = next_match.id

    # Final commit
    db.commit()

    # Return all matches
    return matches

def add_loser_to_bracket(tournament_id: int, loser_id: int, winners_match_num: int, winners_round: int, db: Session) -> None:
    """
    Place team that lost in winners bracket into appropriate losers match.
    For 8 teams:
    Round 1 Losers:
        Match 101: Loser W-R1M1 (team1) vs Loser W-R1M4 (team2)
        Match 102: Loser W-R1M2 (team1) vs Loser W-R1M3 (team2)
    Round 2 Losers:
        Match 101: Winner L-R1M1 (team1) vs Loser W-R2M1 (team2)
        Match 102: Winner L-R1M2 (team1) vs Loser W-R2M2 (team2)
    Round 3 Losers:
        Match 101: Winners from L-R2 matches
    Round 4 Losers:
        Match 101: Winner L-R3M1 vs Loser from Winners Final
    """
    if winners_round == 1:
        # Handle Round 1 losers (same as before)
        total_r1_matches = db.query(Match)\
            .filter(
                Match.tournament_id == tournament_id,
                Match.round == 1
            )\
            .count()
        
        if winners_match_num <= total_r1_matches // 2:
            losers_match_num = 101 if winners_match_num == 1 else 102
            position = 'team1_id'
        else:
            losers_match_num = 101 if winners_match_num == total_r1_matches else 102
            position = 'team2_id'
            
        losers_match = db.query(LosersMatch)\
            .filter(
                LosersMatch.tournament_id == tournament_id,
                LosersMatch.round == winners_round,
                LosersMatch.match_number == losers_match_num
            ).first()
        
        if losers_match:
            setattr(losers_match, position, loser_id)
            db.commit()
    
    elif winners_round == 2:
        # Handle Round 2 losers
        losers_match_num = 101 if winners_match_num == 1 else 102
        losers_match = db.query(LosersMatch)\
            .filter(
                LosersMatch.tournament_id == tournament_id,
                LosersMatch.round == winners_round,
                LosersMatch.match_number == losers_match_num
            ).first()
        
        if losers_match:
            losers_match.team2_id = loser_id
            db.commit()
    
    else:
        # Handle Round 3 and Finals losers
        # For winners semifinal and final losers, they go directly to losers round 4
        target_round = 4 if winners_round >= 3 else winners_round
        
        losers_match = db.query(LosersMatch)\
            .filter(
                LosersMatch.tournament_id == tournament_id,
                LosersMatch.round == target_round,
                LosersMatch.match_number == 101  # Always match 101 for final rounds
            ).first()
        
        if losers_match:
            # For final rounds, losers always go to team2_id position
            # This ensures they face the winner coming up through losers bracket
            losers_match.team2_id = loser_id
            db.commit()

def add_winner_to_championship(tournament_id: int, winner_id: int, db: Session) -> None:
    """
    Place the winner of the losers bracket into the championship match.
    Similar to how add_loser_to_bracket works.
    """
    championship_match = db.query(Match)\
        .filter(
            Match.tournament_id == tournament_id,
            Match.round == 98,
            Match.match_number == 201
        ).first()
    
    if championship_match:
        championship_match.team2_id = winner_id
        db.commit()

def update_losers_bracket(match_id: int, winner_id: int, db: Session) -> LosersMatch:
    try:
        logging.debug(f"Starting update_losers_bracket with match_id={match_id}, winner_id={winner_id}")
        
        # Get the losers match
        losers_match = db.query(LosersMatch).filter(LosersMatch.id == match_id).first()
        if not losers_match:
            logging.error(f"Losers match {match_id} not found")
            raise HTTPException(status_code=404, detail="Losers bracket match not found")
            
        logging.debug(f"Found losers match: round={losers_match.round}, match_number={losers_match.match_number}")
        
        # Update winner
        losers_match.winner_id = winner_id
        db.flush()
        logging.debug("Updated losers match winner")
        
        # Handle championship qualification
        if losers_match.round == 4 and losers_match.match_number == 101:
            logging.debug("This is the final losers bracket match")
            
            # Get championship match explicitly
            championship_match = db.query(Match).filter(
                Match.tournament_id == losers_match.tournament_id,
                Match.round == 98,
                Match.match_number == 201
            ).first()
            
            if championship_match:
                logging.debug(f"Found championship match: id={championship_match.id}")
                logging.debug(f"Current championship state: team1_id={championship_match.team1_id}, team2_id={championship_match.team2_id}")
                
                # Update championship match
                championship_match.team2_id = winner_id
                db.flush()
                logging.debug(f"Updated championship match team2_id to {winner_id}")
                
                # Verify the update
                db.refresh(championship_match)
                logging.debug(f"Championship match after refresh: team2_id={championship_match.team2_id}")
            else:
                logging.error("Championship match not found!")
        
        # Final commit
        db.commit()
        logging.debug("Committed all changes")
        
        # Refresh and return
        db.refresh(losers_match)
        return losers_match
        
    except Exception as e:
        logging.error(f"Error in update_losers_bracket: {str(e)}")
        db.rollback()
        raise
        
'''