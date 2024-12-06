// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { storage } from '../services/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = storage.getSecure('token');
        if (token) {
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            // Token invalid, try refresh
            const credentials = storage.getSecure('credentials');
            if (credentials) {
              const refreshedUser = await authService.refreshAuth();
              setUser(refreshedUser);
            } else {
              throw error;
            }
          }
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        setError(error.message);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (emailOrUsername, password, rememberMe = false) => {
    try {
      setError(null);
      const loggedInUser = await authService.login(emailOrUsername, password, rememberMe);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      setError(error.response?.data?.detail || error.message);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const register = async (email, username, password) => {
    try {
      setError(null);
      const newUser = await authService.register(email, username, password);
      return newUser;
    } catch (error) {
      setError(error.response?.data?.detail || error.message);
      throw error;
    }
  };

  const updateProfile = async (userData) => {
    const updatedUser = await authService.updateProfile(userData);
    setUser(updatedUser);
    return updatedUser;
  }; 

  const resetPassword = async (email) => {
    try {
      setError(null);
      return await authService.resetPassword(email);
    } catch (error) {
      setError(error.response?.data?.detail || error.message);
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const confirmPasswordReset = async (token, newPassword) => {
    try { 
      return await authService.resetPassword(token, newPassword)
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    resetPassword,
    forgotPassword,
    confirmPasswordReset,
    isAuthenticated: !!user,
    isSuperuser: user?.is_superuser || false,
  };

  if (loading) {
    return <div>Loading...</div>; // Replace with your loading component
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};