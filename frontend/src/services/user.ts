// src/services/user.ts
import api from './api';
import config from '../utils/config';

export interface LogoUpdateData {
  logo_url: string;
  logo_public_id: string;
}

export const userService = {
  async getCurrentUserProfile() {
    const response = await api.get(config.endpoints.users.profile);
    return response.data;
  },

  async updateUserProfile(userData: any) {
    const response = await api.put(config.endpoints.users.update, userData);
    return response.data;
  },

  async getAllUsers() {
    const response = await api.get(config.endpoints.users.list);
    return response.data;
  },

  async getUserById(id: number) {
    const response = await api.get(config.endpoints.users.details(id));
    return response.data;
  },

  // Updated logo management methods for file uploads
  async updateUserLogo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.put('/api/v1/users/me/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async removeUserLogo() {
    const response = await api.delete('/api/v1/users/me/logo');
    return response.data;
  }
};