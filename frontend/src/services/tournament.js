// src/services/tournament.js
import api from './api';
import config from '../utils/config';

export const tournamentService = {
  async getAllTournaments() {
    const response = await api.get(config.endpoints.tournaments.list);
    return response.data;
  },

  async createTournament(tournamentData) {
    const response = await api.post(config.endpoints.tournaments.create, tournamentData);
    return response.data;
  },

  async getTournamentById(id) {
    const response = await api.get(config.endpoints.tournaments.details(id));
    return response.data;
  },

  async updateTournament(id, tournamentData) {
    const response = await api.put(config.endpoints.tournaments.update(id), tournamentData);
    return response.data;
  },

  async deleteTournament(id) {
    const response = await api.delete(config.endpoints.tournaments.delete(id));
    return response.data;
  },

  async getTournamentBrackets(id) {
    const response = await api.get(config.endpoints.tournaments.brackets(id));
    return response.data;
  },

  async updateTournamentMatches(id, matchData) {
    const response = await api.put(config.endpoints.tournaments.matches(id), matchData);
    return response.data;
  },

  async updateMatch(matchId, matchData) {
    const response = await api.put(config.endpoints.matches.update(matchId), matchData);
    return response.data;
  },

  async updateLosersMatch(matchId, matchData) {
    // Changed to use the correct endpoint
    const response = await api.put(config.endpoints.matches.updateLosers(matchId), matchData);
    return response.data;
},

async getTournamentMatches(id) {
    try {
        const winnersResponse = await api.get(config.endpoints.matches.tournament(id));
        // Updated to use correct endpoint
        const losersResponse = await api.get(config.endpoints.matches.losersMatches.list(id));

        return {
            winners_bracket: winnersResponse.data.winners_bracket || [],
            losers_bracket: losersResponse.data || [],
            finals: winnersResponse.data.finals || [],
            total_rounds: winnersResponse.data.total_rounds
        };
    } catch (error) {
        console.error('Error fetching tournament matches:', error);
        throw error;
    }
  },

  async getCompletedTournaments() {
    const response = await api.get('/api/v1/tournaments/?status=COMPLETED');
    return response.data;
  }
};