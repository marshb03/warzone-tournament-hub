// src/components/profile/HostProfileManager.tsx
import React, { useState, useEffect } from 'react';
import { Edit2, Building } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api'; // Use your existing API service

interface HostProfile {
  id: number;
  user_id: number;
  organization_name: string;
  description?: string;
  banner_path?: string;
  logo_url?: string;
  logo_public_id?: string;
  twitter_url?: string;
  discord_url?: string;
}

interface HostProfileUpdate {
  organization_name?: string;
  description?: string;
  banner_path?: string;
}

const HostProfileManager: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    organization_name: '',
    description: '',
    banner_path: ''
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchHostProfile();
  }, [user]);

  const fetchHostProfile = async () => {
    if (!user || (user.role !== 'HOST' && user.role !== 'SUPER_ADMIN')) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get(`/api/v1/hosts/${user.id}`);
      
      setHostProfile(response.data);
      setEditForm({
        organization_name: response.data.organization_name || '',
        description: response.data.description || '',
        banner_path: response.data.banner_path || ''
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Profile doesn't exist, set defaults
        setHostProfile(null);
        setEditForm({
          organization_name: user.username,
          description: '',
          banner_path: ''
        });
      } else {
        console.error('Error fetching host profile:', error);
        setError('Failed to load host profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !editForm.organization_name.trim()) return;

    try {
      setError('');
      
      const payload = {
        organization_name: editForm.organization_name.trim(),
        description: editForm.description.trim() || null,
        banner_path: editForm.banner_path.trim() || null
      };

      console.log('Saving host profile:', payload); // Debug log

      const response = await api.put(`/api/v1/hosts/${user.id}`, payload);
      
      setHostProfile(response.data);
      setIsEditing(false);
      
      // Refresh user data to update organization name in header/context
      await refreshUser();
      
      console.log('Host profile saved successfully');
    } catch (error: any) {
      console.error('Error saving host profile:', error);
      setError(
        error.response?.data?.detail || 
        error.message || 
        'Failed to save profile'
      );
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    // Reset form to current values
    if (hostProfile) {
      setEditForm({
        organization_name: hostProfile.organization_name || '',
        description: hostProfile.description || '',
        banner_path: hostProfile.banner_path || ''
      });
    }
  };

  if (!user || (user.role !== 'HOST' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1 flex items-center">
            <Building className="h-5 w-5 mr-2 text-blue-400" />
            Host Profile
          </h2>
          <p className="text-sm text-gray-400">
            Manage your organization and hosting information
          </p>
        </div>
        
        {!isEditing && (
          <Button
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="flex items-center hover:bg-white/10"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              value={editForm.organization_name}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                organization_name: e.target.value
              }))}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your organization name"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              This will be used as your default logo text and display name
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                description: e.target.value
              }))}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              placeholder="Describe your organization and what you do..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Banner Path
            </label>
            <input
              type="text"
              value={editForm.banner_path}
              onChange={(e) => setEditForm(prev => ({
                ...prev,
                banner_path: e.target.value
              }))}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Path to banner image (optional)"
            />
            <p className="text-xs text-gray-400 mt-1">
              Optional: URL or path to a banner image for your profile
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <Button
              variant="ghost"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!editForm.organization_name.trim()}
            >
              Save Profile
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Organization Name</p>
            <p className="font-medium text-white">
              {hostProfile?.organization_name || user.username}
            </p>
          </div>
          
          {hostProfile?.description && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Description</p>
              <p className="text-white whitespace-pre-wrap">
                {hostProfile.description}
              </p>
            </div>
          )}
          
          {hostProfile?.banner_path && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Banner Path</p>
              <p className="text-white font-mono text-sm bg-gray-800 rounded px-3 py-2">
                {hostProfile.banner_path}
              </p>
            </div>
          )}

          {!hostProfile?.description && !hostProfile?.banner_path && (
            <div className="text-center py-8 text-gray-400">
              <Building className="h-12 w-12 mx-auto mb-3 text-gray-600" />
              <p className="text-sm">
                Complete your host profile to showcase your organization
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default HostProfileManager;