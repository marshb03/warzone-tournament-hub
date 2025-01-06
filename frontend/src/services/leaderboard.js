// src/services/leaderboard.js
import api from './api';
// import config from '../utils/config';

export const leaderboardService = {
    processTeamMatchHistory(matches) {
      const teamStats = {};
  
      // Sort matches by round to ensure chronological order
      const sortedMatches = [...matches].sort((a, b) => {
        if (a.round !== b.round) return a.round - b.round;
        return a.match_number - b.match_number;
      });
  
      // First pass: Initialize team stats and record matches chronologically
      sortedMatches.forEach(match => {
        if (!match.winner_id || !match.team1_id || !match.team2_id) return;
  
        // Get loser ID
        const loserId = match.team1_id === match.winner_id ? match.team2_id : match.team1_id;
  
        // Initialize winner stats if not exists
        if (!teamStats[match.winner_id]) {
          teamStats[match.winner_id] = {
            teamId: match.winner_id,
            teamName: match.team1_id === match.winner_id ? 
              (match.team1?.name || `Team ${match.winner_id}`) : 
              (match.team2?.name || `Team ${match.winner_id}`),
            wins: 0,
            losses: 0,
            matchHistory: [],
            firstLossRound: null
          };
        }
  
        // Initialize loser stats if not exists
        if (!teamStats[loserId]) {
          teamStats[loserId] = {
            teamId: loserId,
            teamName: match.team1_id === loserId ? 
              (match.team1?.name || `Team ${loserId}`) : 
              (match.team2?.name || `Team ${loserId}`),
            wins: 0,
            losses: 0,
            matchHistory: [],
            firstLossRound: null
          };
        }
  
        // Record match result
        teamStats[match.winner_id].wins++;
        teamStats[loserId].losses++;
  
        // Record first loss round
        if (teamStats[loserId].firstLossRound === null) {
          teamStats[loserId].firstLossRound = match.round;
        }
  
        // Add to match history
        teamStats[match.winner_id].matchHistory.push({
          result: 'W',
          round: match.round,
          matchNumber: match.match_number
        });
        teamStats[loserId].matchHistory.push({
          result: 'L',
          round: match.round,
          matchNumber: match.match_number
        });
      });
  
      return teamStats;
    },
  
    calculateRankings(matches) {
        if (!matches || matches.length === 0) {
          return [];
        }
    
        const teamStats = this.processTeamMatchHistory(matches);
        const rankings = Object.values(teamStats);
    
        // Sort teams by our ranking criteria
        rankings.sort((a, b) => {
          // First, find tournament winner (most wins with 0-1 losses)
          const aIsWinner = a.losses <= 1;
          const bIsWinner = b.losses <= 1;
          
          if (aIsWinner && !bIsWinner) return -1;
          if (bIsWinner && !aIsWinner) return 1;
          
          // If both or neither are potential winners, sort by wins
          if (b.wins !== a.wins) {
            return b.wins - a.wins;
          }
    
          // For teams with equal wins,
          // sort by when they got their first loss (later = better)
          if (a.firstLossRound !== b.firstLossRound) {
            return b.firstLossRound - a.firstLossRound;
          }
    
          return 0;
        });
    
        // Add rank property to teams
        return rankings.map((team, index) => ({
          ...team,
          rank: index + 1
        }));
      },
  
    async getLeaderboard(tournamentId) {
      try {
        const response = await api.get(`/api/v1/leaderboard/tournament/${tournamentId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
      }
    }
  };