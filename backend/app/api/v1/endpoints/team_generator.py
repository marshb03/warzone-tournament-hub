# app/api/v1/endpoints/team_generator.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
import random

router = APIRouter()

class TeamGeneratorInput(BaseModel):
    lists: List[List[str]] = Field(..., min_items=1, max_items=4)
    team_size: int = Field(..., ge=2, le=4)

class GeneratedTeams(BaseModel):
    teams: List[List[str]]

def generate_teams_two_lists_size_four(list1: List[str], list2: List[str]) -> List[List[str]]:
    random.shuffle(list1)
    random.shuffle(list2)
    num_teams = min(len(list1), len(list2)) // 2
    teams = []
    for i in range(num_teams):
        team = list1[i*2:(i+1)*2] + list2[i*2:(i+1)*2]
        random.shuffle(team)
        teams.append(team)
    # Handle any remaining players
    remaining = list1[num_teams*2:] + list2[num_teams*2:]
    for i, player in enumerate(remaining):
        teams[i % len(teams)].append(player)
    return teams

@router.post("/generate", response_model=GeneratedTeams)
async def generate_teams(input_data: TeamGeneratorInput):
    # Validate that no list exceeds 150 players
    for i, player_list in enumerate(input_data.lists):
        if len(player_list) > 150:
            raise HTTPException(
                status_code=400, 
                detail=f"List {i+1} exceeds the maximum of 150 players"
            )

    num_lists = len(input_data.lists)
    total_players = sum(len(player_list) for player_list in input_data.lists)
    
    # Special case: 2 lists and team size of 4
    if num_lists == 2 and input_data.team_size == 4:
        teams = generate_teams_two_lists_size_four(input_data.lists[0], input_data.lists[1])
    else:
        if num_lists > 1 and total_players < num_lists * input_data.team_size:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough players to form teams of size {input_data.team_size} with players from different lists"
            )

        # Shuffle each list independently
        shuffled_lists = [list(player_list) for player_list in input_data.lists]
        for player_list in shuffled_lists:
            random.shuffle(player_list)

        # Calculate the number of teams
        num_teams = total_players // input_data.team_size

        # Initialize teams
        teams = [[] for _ in range(num_teams)]

        # Distribute players to teams
        for i in range(num_teams):
            for j in range(num_lists):
                if shuffled_lists[j]:
                    teams[i].append(shuffled_lists[j].pop())

        # Distribute remaining players
        remaining_players = [player for sublist in shuffled_lists for player in sublist]
        random.shuffle(remaining_players)
        for i, player in enumerate(remaining_players):
            teams[i % num_teams].append(player)

        # If there's only one list, we need to reshuffle to meet the team size requirement
        if num_lists == 1:
            all_players = [player for team in teams for player in team]
            random.shuffle(all_players)
            teams = [all_players[i:i + input_data.team_size] for i in range(0, len(all_players), input_data.team_size)]

    return GeneratedTeams(teams=teams)