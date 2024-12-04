// src/services/team.js
import api from './api';
import config from '../utils/config';

export const teamService = {
  async getAllTeams() {
    const response = await api.get(config.endpoints.teams.list);
    return response.data;
  },

  async createTeam(teamData) {
    const response = await api.post(config.endpoints.teams.create, teamData);
    return response.data;
  },

  async getTeamById(id) {
    const response = await api.get(config.endpoints.teams.details(id));
    return response.data;
  },

  async updateTeam(id, teamData) {
    const response = await api.put(config.endpoints.teams.update(id), teamData);
    return response.data;
  },

  async deleteTeam(id) {
    const response = await api.delete(config.endpoints.teams.delete(id));
    return response.data;
  }
};