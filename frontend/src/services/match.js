// src/services/match.js
import api from './api';
import config from '../utils/config';

// Add match endpoints to config.js first
const matchEndpoints = {
  base: '/api/v1/matches',
  create: '/api/v1/matches',
  createLosers: '/api/v1/matches/losers',
  details: (id) => `/api/v1/matches/${id}`,
  tournament: (id) => `/api/v1/matches/tournament/${id}`,
  update: (id) => `/api/v1/matches/${id}`,
  updateLosers: (id) => `/api/v1/matches/losers/${id}`,
  delete: (id) => `/api/v1/matches/${id}`,
};

export const matchService = {
  // Create a new match in the winners bracket
  async createMatch(matchData) {
    const response = await api.post(matchEndpoints.create, matchData);
    return response.data;
  },

  // Create a new match in the losers bracket
  async createLosersMatch(matchData) {
    const response = await api.post(matchEndpoints.createLosers, matchData);
    return response.data;
  },

  // Get a specific match (either winners or losers bracket)
  async getMatch(matchId) {
    const response = await api.get(matchEndpoints.details(matchId));
    return response.data;
  },

  // Get all matches for a tournament
  async getTournamentMatches(tournamentId) {
    const response = await api.get(matchEndpoints.tournament(tournamentId));
    return response.data;
  },

  // Update a match in either bracket
  async updateMatch(matchId, matchData) {
    const response = await api.put(matchEndpoints.update(matchId), matchData);
    return response.data;
  },

  // Specifically update a losers bracket match
  async updateLosersMatch(matchId, matchData) {
    const response = await api.put(matchEndpoints.updateLosers(matchId), matchData);
    return response.data;
  },

  // Delete a match from either bracket
  async deleteMatch(matchId) {
    const response = await api.delete(matchEndpoints.delete(matchId));
    return response.data;
  },

  // Helper method to determine if a response is a double elimination format
  isDoubleElimination(response) {
    return response.hasOwnProperty('winners_bracket') && 
           response.hasOwnProperty('losers_bracket') && 
           response.hasOwnProperty('finals');
  }
};