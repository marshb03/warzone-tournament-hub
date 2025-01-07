# app/models/__init__.py
from .base import Base
from .user import User, UserRole  # Add UserRole
from .tournament import Tournament, TournamentFormat  # Add TournamentFormat
from .team import Team
from .match import Match
from .leaderboard import LeaderboardEntry
from .associations import team_player
from .losers_match import LosersMatch
from .player_ranking import PlayerRanking

# Export enums directly for easier access
__all__ = [
    'Base',
    'User',
    'UserRole',
    'Tournament',
    'TournamentFormat',
    'Team',
    'Match',
    'LeaderboardEntry',
    'team_player',
    'LosersMatch',
    'PlayerRanking'
]