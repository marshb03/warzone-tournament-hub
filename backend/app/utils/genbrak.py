def generate_bracket(tournament_id: int, teams: List[Team], db: Session) -> List[Match]:
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise ValueError("Tournament not found")

    num_teams = len(teams)
    if num_teams < 2:
        raise ValueError("At least 2 teams are required for a tournament")

    num_rounds = math.ceil(math.log2(num_teams))
    num_byes = 2**num_rounds - num_teams

    matches = []
    round_num = 1

    # Create first round matches
    teams_queue = teams.copy()
    for i in range(2**(num_rounds-1)):
        match = Match(
            tournament_id=tournament_id,
            round=round_num,
            match_number=i + 1
        )
        if len(teams_queue) >= 2:
            team1 = teams_queue.pop(0)
            team2 = teams_queue.pop(0)
            match.team1_id = team1.id
            match.team2_id = team2.id
        elif len(teams_queue) == 1:
            team1 = teams_queue.pop(0)
            match.team1_id = team1.id
        matches.append(match)

    # Create subsequent round matches
    for round in range(2, num_rounds + 1):
        num_matches = 2**(num_rounds - round)
        for i in range(num_matches):
            match = Match(
                tournament_id=tournament_id,
                round=round,
                match_number=i + 1
            )
            matches.append(match)

    # Save matches to database to generate IDs
    db.add_all(matches)
    db.flush()

    # Set next_match_id for all matches except the final
    for round in range(1, num_rounds):
        matches_in_round = [m for m in matches if m.round == round]
        next_round_matches = [m for m in matches if m.round == round + 1]
        for i, match in enumerate(matches_in_round):
            match.next_match_id = next_round_matches[i // 2].id

    # Commit all changes
    db.commit()

    return matches
