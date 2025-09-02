// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { userService } from '../services/user';
import { storage } from '../services/storage';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  // Logo fields
  logo_url?: string;
  logo_public_id?: string;
  organization_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (emailOrUsername: string, password: string, rememberMe?: boolean) => Promise<User>;
  logout: () => void;
  register: (email: string, username: string, password: string) => Promise<any>;
  updateProfile: (userData: any) => Promise<User>;
  resetPassword: (email: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<any>;
  refreshUser: () => Promise<void>; // New method to refresh user data
  isAuthenticated: boolean;
  isSuperuser: boolean;
  isHost: boolean;
}

// Export the context so it can be imported elsewhere if needed
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = storage.getSecure('token');
        if (token) {
          try {
            // Use the updated endpoint that includes logo info
            const currentUser = await userService.getCurrentUserProfile();
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
        setError((error as Error).message);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (emailOrUsername: string, password: string, rememberMe: boolean = false): Promise<User> => {
    try {
      setError(null);
      const loggedInUser = await authService.login(emailOrUsername, password, rememberMe);
      // Fetch full user profile with logo info
      const fullUserProfile = await userService.getCurrentUserProfile();
      setUser(fullUserProfile);
      return fullUserProfile;
    } catch (error) {
      setError((error as any).response?.data?.detail || (error as Error).message);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      setError(null);
      const newUser = await authService.register(email, username, password);
      return newUser;
    } catch (error) {
      setError((error as any).response?.data?.detail || (error as Error).message);
      throw error;
    }
  };

  const updateProfile = async (userData: any): Promise<User> => {
    const updatedUser = await authService.updateProfile(userData);
    setUser(updatedUser);
    return updatedUser;
  }; 

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      return await authService.resetPassword(email);
    } catch (error) {
      setError((error as any).response?.data?.detail || (error as Error).message);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const confirmPasswordReset = async (token: string, newPassword: string) => {
    try { 
      return await authService.resetPassword(token, newPassword)
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  // New method to refresh user data (useful after logo upload)
  const refreshUser = async (): Promise<void> => {
    try {
      const updatedUser = await userService.getCurrentUserProfile();
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value: AuthContextType = {
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
    refreshUser,
    isAuthenticated: !!user,
    isSuperuser: user?.role === 'SUPER_ADMIN',
    isHost: user?.role === 'HOST'
  }

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