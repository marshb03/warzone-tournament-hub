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
  }
};