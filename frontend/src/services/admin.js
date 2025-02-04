// src/services/admin.js
import api from './api';
import config from '../utils/config';

export const adminService = {
    async getDashboardStats() {
        try {
            const response = await api.get('/api/v1/admin/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    async getAllUsers() {
        try {
            console.log('API URL:', config.apiUrl); // Debug log
            console.log('Endpoint:', config.endpoints.admin.users); // Debug log
            const response = await api.get(config.endpoints.admin.users);
            return response.data;
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            throw error;
        }
    },

    async promoteUser(userId) {
        const response = await api.put(`/api/v1/users/${userId}/promote`);
        return response.data;
    },

    async demoteUser(userId) {
        const response = await api.put(`/api/v1/users/${userId}/demote`);
        return response.data;
    },

    async toggleUserActive(userId) {
        const response = await api.put(`/api/v1/users/${userId}/toggle-active`);
        return response.data;
    },

    async getAllTournaments() {
        const response = await api.get('/api/v1/tournaments/');
        return response.data;
    },

    async startTournament(id) {
        const response = await api.post(`/api/v1/tournaments/${id}/start`);
        return response.data;
    },

    async completeTournament(id) {
        const response = await api.post(`/api/v1/tournaments/${id}/end`);
        return response.data;
    },

    async resetTournament(id) {
        const response = await api.post(`/api/v1/tournaments/${id}/reset`);
        return response.data;
    },

    async deleteTournament(id) {
        const response = await api.delete(`/api/v1/tournaments/${id}`);
        return response.data;
    }
};