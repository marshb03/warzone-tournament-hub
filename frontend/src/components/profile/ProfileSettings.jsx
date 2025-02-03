// src/components/profile/ProfileSettings.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, X } from 'lucide-react';
import PasswordRequirements from '../auth/PasswordRequirements';
import api from '../../services/api';

const authService = {
  async requestProfileUpdateToken() {
    const response = await api.post('/api/v1/request-profile-update');
    return response.data.token;
  },

  async updateProfile(token, userData) {
    const response = await api.put(`/api/v1/update-profile/${token}`, userData);
    return response.data;
  }
};

const ProfileSettings = ({ onClose }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = await authService.requestProfileUpdateToken();

      const updateData = {
        username: formData.username,
        email: formData.email,
      };

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          return;
        }
        updateData.current_password = formData.currentPassword;
        updateData.password = formData.newPassword;
      }

      await authService.updateProfile(token, updateData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);

      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-md p-6 border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-md">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/50 rounded-md">
            <p className="text-green-500">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-[#2979FF] focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-[#2979FF] focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {isEditing && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  New Password (Optional)
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                />
              </div>

              {formData.newPassword && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-500
                               focus:outline-none focus:ring-2 focus:ring-[#2979FF] focus:border-transparent"
                    />
                  </div>
                  <PasswordRequirements password={formData.newPassword} />
                </>
              )}
            </>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-white/10 rounded-md text-sm font-medium text-gray-300 
                           hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2979FF] rounded-md text-sm font-medium text-white 
                           hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-[#2979FF] rounded-md text-sm font-medium text-white 
                         hover:bg-blue-600 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;