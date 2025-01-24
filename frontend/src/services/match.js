// src/services/match.js
import api from './api';
import config from '../utils/config';

export const matchService = {
    // Get a specific match (either winners or losers bracket)
    async getMatch(matchId) {
        const response = await api.get(config.endpoints.matches.base + '/' + matchId);
        return response.data;
    },

    // Get all matches for a tournament
    async getTournamentMatches(tournamentId) {
        const response = await api.get(config.endpoints.matches.tournament(tournamentId));
        return response.data;
    },

    // Update winners bracket match
    async updateWinnersMatch(matchId, updateData) {
        try {
            const response = await api.put(config.endpoints.matches.winners(matchId), updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating winners match:', error);
            throw error;
        }
    },

    // Update losers bracket match
    async updateLosersMatch(matchId, matchData) {
        try {
            const response = await api.put(config.endpoints.matches.losers(matchId), matchData);
            return response.data;
        } catch (error) {
            console.error('Error updating losers match:', error);
            throw error;
        }
    },

    // Update championship match
    async updateChampionshipMatch(matchId, matchData) {
        try {
            const response = await api.put(config.endpoints.matches.championship(matchId), matchData);
            return response.data;
        } catch (error) {
            console.error('Error updating championship match:', error);
            throw error;
        }
    },

   // Helper method to determine if a response is a double elimination format
  isDoubleElimination(response) {
    return Object.prototype.hasOwnProperty.call(response, 'winners_bracket') && 
           Object.prototype.hasOwnProperty.call(response, 'losers_bracket') && 
           Object.prototype.hasOwnProperty.call(response, 'finals');
  }
};