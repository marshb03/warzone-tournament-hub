# app/services/tkr_auto_start.py - TKR Tournament Auto-Start Service
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
import logging

from app.models.tournament import Tournament, TournamentFormat, TournamentStatus
from app.models.tkr import TKRTournamentConfig
from app.db.database import SessionLocal

logger = logging.getLogger(__name__)

class TKRAutoStartService:
    """Service to automatically start TKR tournaments at their scheduled time"""
    
    @staticmethod
    def check_and_start_tournaments() -> List[int]:
        """
        Check for TKR tournaments that should be started and start them.
        Returns list of tournament IDs that were started.
        """
        db = SessionLocal()
        started_tournaments = []
        
        try:
            current_time = datetime.utcnow()
            
            # Find TKR tournaments that should be started
            tournaments_to_start = db.query(Tournament).join(TKRTournamentConfig).filter(
                Tournament.format == TournamentFormat.TKR,
                Tournament.status == TournamentStatus.PENDING,
                Tournament.start_date <= current_time.date(),
                Tournament.start_time <= current_time.strftime('%H:%M')
            ).all()
            
            for tournament in tournaments_to_start:
                # Double-check the exact start time
                tournament_start_datetime = datetime.combine(
                    tournament.start_date,
                    datetime.strptime(tournament.start_time, '%H:%M').time()
                )
                
                if current_time >= tournament_start_datetime:
                    # Start the tournament
                    tournament.status = TournamentStatus.ONGOING
                    started_tournaments.append(tournament.id)
                    
                    logger.info(f"Auto-started TKR tournament {tournament.id}: {tournament.name}")
            
            if started_tournaments:
                db.commit()
                logger.info(f"Auto-started {len(started_tournaments)} TKR tournaments")
            
        except Exception as e:
            logger.error(f"Error in TKR auto-start service: {str(e)}")
            db.rollback()
        finally:
            db.close()
            
        return started_tournaments
    
    @staticmethod
    def check_and_end_tournaments() -> List[int]:
        """
        Check for TKR tournaments that should be ended and end them.
        Returns list of tournament IDs that were ended.
        """
        db = SessionLocal()
        ended_tournaments = []
        
        try:
            current_time = datetime.utcnow()
            
            # Find TKR tournaments that should be ended
            tournaments_to_end = db.query(Tournament).join(TKRTournamentConfig).filter(
                Tournament.format == TournamentFormat.TKR,
                Tournament.status == TournamentStatus.ONGOING,
                Tournament.end_date.isnot(None),
                Tournament.end_date <= current_time.date()
            ).all()
            
            for tournament in tournaments_to_end:
                # Check if we have an end time
                if tournament.end_time:
                    tournament_end_datetime = datetime.combine(
                        tournament.end_date,
                        datetime.strptime(tournament.end_time, '%H:%M').time()
                    )
                    
                    if current_time >= tournament_end_datetime:
                        tournament.status = TournamentStatus.COMPLETED
                        ended_tournaments.append(tournament.id)
                        logger.info(f"Auto-ended TKR tournament {tournament.id}: {tournament.name}")
                else:
                    # If no end time specified, end at end of day
                    tournament_end_datetime = datetime.combine(
                        tournament.end_date,
                        datetime.strptime('23:59', '%H:%M').time()
                    )
                    
                    if current_time >= tournament_end_datetime:
                        tournament.status = TournamentStatus.COMPLETED
                        ended_tournaments.append(tournament.id)
                        logger.info(f"Auto-ended TKR tournament {tournament.id}: {tournament.name} (end of day)")
            
            if ended_tournaments:
                db.commit()
                logger.info(f"Auto-ended {len(ended_tournaments)} TKR tournaments")
                
        except Exception as e:
            logger.error(f"Error in TKR auto-end service: {str(e)}")
            db.rollback()
        finally:
            db.close()
            
        return ended_tournaments

# Background task runner (you'll need to set this up with your task system)
def run_tkr_auto_start_check():
    """Background task to check for tournaments to start/end"""
    service = TKRAutoStartService()
    started = service.check_and_start_tournaments()
    ended = service.check_and_end_tournaments()
    
    return {
        "started_tournaments": started,
        "ended_tournaments": ended,
        "timestamp": datetime.utcnow().isoformat()
    }