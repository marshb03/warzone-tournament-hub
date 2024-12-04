// src/services/user.js
import api from './api';
import config from '../utils/config';

export const userService = {
  async getCurrentUserProfile() {
    const response = await api.get(config.endpoints.users.profile);
    return response.data;
  },

  async updateUserProfile(userData) {
    const response = await api.put(config.endpoints.users.update, userData);
    return response.data;
  },

  async getAllUsers() {
    const response = await api.get(config.endpoints.users.list);
    return response.data;
  },

  async getUserById(id) {
    const response = await api.get(config.endpoints.users.details(id));
    return response.data;
  }
};
