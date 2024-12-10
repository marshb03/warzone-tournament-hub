// src/services/api.js
import axios from 'axios';
import { storage } from './storage';
import { authService } from './auth';
import config from '../utils/config';

const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = storage.getSecure('token');
    if (token) {
      // Make sure there's no extra whitespace
      config.headers.Authorization = token.trim();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await authService.refreshAuth();
        const newToken = storage.getSecure('token');
        originalRequest.headers.Authorization = newToken;
        return api(originalRequest);
      } catch (refreshError) {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;