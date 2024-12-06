// src/services/auth.js
import api from './api';
import { storage } from './storage';

export const authService = {
// In auth.js, update the login function
async login(emailOrUsername, password, rememberMe = false) {
    const formData = new FormData();
    formData.append('username', emailOrUsername);
    formData.append('password', password);
    
    try {
      const response = await api.post('/api/v1/login/access-token', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Try this instead of undefined
        },
        withCredentials: true,
      });
      
      console.log('Login response:', response.data); // Debug log
  
      const { access_token, token_type } = response.data;
      const fullToken = `${token_type} ${access_token}`;
      
      storage.setSecure('token', fullToken);
  
      if (rememberMe) {
        storage.setSecure('credentials', {
          emailOrUsername,
          password,
          timestamp: Date.now()
        });
      }
  
      // Get user details
      const user = await this.getCurrentUser();
      console.log('Logged in user:', user)
      return user;
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  async requestProfileUpdateToken() {
    const response = await api.post('/api/v1/request-profile-update');
    return response.data.token;
  },

  async updateProfile(token, userData) {
    const response = await api.put(`/api/v1/update-profile/${token}`, userData);
    return response.data;
  },

  async forgotPassword(email) {
    try {
      // Log the attempt
      console.log('Attempting to send reset email to:', email);
      const response = await api.post(`/api/v1/forgot-password?email=${email}`);
      console.log('Reset email response:', response);
      return response.data;
    } catch (error) {
      console.error('Reset email error:', error);
      throw error;
    }
  },

  async register(email, username, password) {
    try {
      const response = await api.post('/api/v1/users/users', {
        email,
        username,
        password,
      });
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration service error:', error);
      throw error;
    }
  },
  
  async getCurrentUser() {
    const response = await api.post('/api/v1/test-token');
    const user = response.data;
    storage.setSecure('user', user);
    return user;
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await api.post(`/api/v1/reset-password/${token}`, {
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Reset password service error:', error);
      throw error;
    }
  },
  
  async refreshAuth() {
    const credentials = storage.getSecure('credentials');
    if (!credentials) {
      throw new Error('No stored credentials');
    }

    // Check if stored credentials are not too old (30 days)
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - credentials.timestamp > thirtyDays) {
      this.logout();
      throw new Error('Stored credentials expired');
    }

    return this.login(credentials.emailOrUsername, credentials.password, true);
  },

  logout() {
    storage.remove('token');
    storage.remove('user');
    storage.remove('credentials');
    localStorage.clear();
  },

  isAuthenticated() {
    return !!storage.getSecure('token');
  }
};