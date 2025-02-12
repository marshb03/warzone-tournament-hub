// src/pages/Profile.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileSettings from '../components/profile/ProfileSettings';
import ApplicationStatus from '../components/profile/ApplicationStatus';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Trophy, Users, Shield, Settings } from 'lucide-react';
import PageBackground from '../components/backgrounds/PageBackground';

const Profile = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          label: 'Super Admin',
          class: 'bg-purple-500/20 text-purple-500'
        };
      case 'HOST':
        return {
          label: 'Tournament Host',
          class: 'bg-blue-500/20 text-blue-500'
        };
      default:
        return {
          label: 'User',
          class: 'bg-gray-500/20 text-gray-400'
        };
    }
  };

  const roleInfo = getRoleDisplay(user?.role);

  return (
    <PageBackground>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Profile</h1>
        
        <div className="space-y-6">
          {/* Basic Info Card */}
          <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">Account Information</h2>
                <p className="text-sm text-gray-400">Manage your account details</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center hover:bg-white/10"
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Username</p>
                <p className="font-medium text-white">{user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <p className="font-medium text-white">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Role</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${roleInfo.class}`}>
                  {roleInfo.label}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  user?.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </Card>

          {/* Application Status */}
          <ApplicationStatus />

          {/* Super Admin Section */}
          {user?.role === 'SUPER_ADMIN' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Admin Controls</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/admin"
                  className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                >
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-[#2979FF] mr-3" />
                    <div>
                      <h3 className="font-semibold text-white">Admin Dashboard</h3>
                      <p className="text-sm text-gray-400">Manage system settings</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/tournaments/new"
                  className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-[#2979FF] mr-3" />
                    <div>
                      <h3 className="font-semibold text-white">Create Tournament</h3>
                      <p className="text-sm text-gray-400">Start a new tournament</p>
                    </div>
                  </div>
                </Link>
              </div>
            </Card>
          )}

          {/* Host Section */}
          {user?.role === 'HOST' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Host Controls</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/host"
                  className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                >
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 text-[#2979FF] mr-3" />
                    <div>
                      <h3 className="font-semibold text-white">Host Dashboard</h3>
                      <p className="text-sm text-gray-400">Manage your tournaments</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/tournaments/new"
                  className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                >
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 text-[#2979FF] mr-3" />
                    <div>
                      <h3 className="font-semibold text-white">Create Tournament</h3>
                      <p className="text-sm text-gray-400">Start a new tournament</p>
                    </div>
                  </div>
                </Link>
              </div>
            </Card>
          )}
        </div>
        
        {/* Settings Modal */}
        {isModalOpen && (
          <ProfileSettings onClose={() => setIsModalOpen(false)} />
        )}
      </div>
    </PageBackground>
  );
};

export default Profile;