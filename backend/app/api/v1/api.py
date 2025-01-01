# app/api/v1/api.py
from fastapi import APIRouter

from app.api.v1.endpoints import auth, tournament, team, match, user, leaderboard, player_ranking, team_generator, losers_match

api_router = APIRouter()

api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(user.router, prefix="/users", tags=["users"])
api_router.include_router(tournament.router, prefix="/tournaments", tags=["tournaments"])
api_router.include_router(team.router, prefix="/teams", tags=["teams"])
api_router.include_router(match.router, prefix="/matches", tags=["matches"])
api_router.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])
api_router.include_router(player_ranking.router, prefix="/player-ranking", tags=["player-ranking"])
api_router.include_router(team_generator.router, prefix="/team-generator", tags=["team-generator"])
api_router.include_router(losers_match.router, prefix="/losers-matches", tags=["matches"])


