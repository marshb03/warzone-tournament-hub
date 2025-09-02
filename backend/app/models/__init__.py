# app/models/__init__.py
from .base import Base
from .user import User, UserRole 
from .tournament import Tournament, TournamentFormat, TournamentStatus  
from .team import Team
from .match import Match
from .leaderboard import LeaderboardEntry
from .associations import team_player
from .losers_match import LosersMatch
from .player_ranking import PlayerRanking
from .host_profile import HostProfile
from .host_application import ApplicationStatus, HostApplication
from .activity_log import ActivityLog, ActivityType
from .system_health import SystemHealth, MetricType
from .user_social_links import SocialPlatform, UserSocialLink

# Export enums directly for easier access
__all__ = [
    'Base',
    'User',
    'UserRole',
    'Tournament',
    'TournamentFormat',
    'TournamentStatus',
    'Team',
    'Match',
    'LeaderboardEntry',
    'team_player',
    'LosersMatch',
    'PlayerRanking',
    'ActivityLog',
    'ActivityType',
    'SystemHealth',
    'MetricType', 
    'HostProfile',
    'ApplicationStatus',
    'HostApplication', 
    'SocialPlatform', 
    'UserSocialLink'
]