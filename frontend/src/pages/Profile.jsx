// src/pages/Profile.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, isSuperuser } = useAuth();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Account Information</h2>
          <p className="text-gray-600">Username: {user?.username}</p>
          <p className="text-gray-600">Email: {user?.email}</p>
          <p className="text-gray-600">Role: {isSuperuser ? 'Administrator' : 'User'}</p>
        </div>
      </div>

      {/* Admin Section - Only visible to superusers */}
      {isSuperuser && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/admin/tournaments"
                className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
              >
                <h3 className="font-semibold text-blue-900">Tournament Management</h3>
                <p className="text-sm text-blue-700">Create and manage tournaments</p>
              </Link>

              <Link
                to="/admin/users"
                className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
              >
                <h3 className="font-semibold text-blue-900">User Management</h3>
                <p className="text-sm text-blue-700">Manage user accounts and permissions</p>
              </Link>

              <Link
                to="/admin"
                className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
              >
                <h3 className="font-semibold text-blue-900">Admin Dashboard</h3>
                <p className="text-sm text-blue-700">View overall system statistics</p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Regular User Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Activity</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/tournaments"
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200"
            >
              <h3 className="font-semibold">Your Tournaments</h3>
              <p className="text-sm text-gray-600">View tournaments you&apos;ve participated in</p>
            </Link>

            <Link
              to="/team-generator"
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200"
            >
              <h3 className="font-semibold">Team Generator</h3>
              <p className="text-sm text-gray-600">Create and manage your teams</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;