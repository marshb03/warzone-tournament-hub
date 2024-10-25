from sqlalchemy.orm import Session
from app.models.tournament import Tournament, TournamentStatus
from app.models.match import Match
from app.models.leaderboard import LeaderboardEntry

def get_tournament_leaderboard(db: Session, tournament_id: int):
    return db.query(LeaderboardEntry).filter(LeaderboardEntry.tournament_id == tournament_id).order_by(LeaderboardEntry.points.desc()).all()

def create_or_update_leaderboard_entry(db: Session, tournament_id: int, team_id: int, wins: int = 0, losses: int = 0, points: int = 0):
    entry = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.tournament_id == tournament_id,
        LeaderboardEntry.team_id == team_id
    ).first()

    if entry:
        entry.wins += wins
        entry.losses += losses
        entry.points += points
    else:
        entry = LeaderboardEntry(
            tournament_id=tournament_id,
            team_id=team_id,
            wins=wins,
            losses=losses,
            points=points
        )
        db.add(entry)

    db.commit()
    db.refresh(entry)
    return entry


def reset_tournament(db: Session, tournament_id: int):
    # Reset tournament status
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        return None
    tournament.status = TournamentStatus.PENDING

    # Delete all matches
    db.query(Match).filter(Match.tournament_id == tournament_id).delete()

    # Reset leaderboard
    db.query(LeaderboardEntry).filter(LeaderboardEntry.tournament_id == tournament_id).delete()

    db.commit()
    return tournament