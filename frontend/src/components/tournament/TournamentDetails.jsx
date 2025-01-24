// src/components/tournament/TournamentDetails.jsx
import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext'; // For user context
import { UserRole } from '../../types/user';

const TournamentDetails = ({ tournament, onUpdate, canManage }) => {
    const { user } = useAuth(); // Get user from auth context
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
      name: tournament.name,
      format: tournament.format,
      start_date: tournament.start_date?.split('T')[0], // Format date for input
      start_time: tournament.start_time,
      team_size: tournament.team_size,
      max_teams: tournament.max_teams,
      description: tournament.description || '',
      rules: tournament.rules || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          await onUpdate(formData);
          setIsEditing(false);
        } catch (error) {
          console.error('Failed to update tournament:', error);
        }
      };
  
    // Only show edit button if user is tournament creator
    const canEdit = canManage && (
        user?.role === UserRole.SUPER_ADMIN || 
        (user?.role === UserRole.HOST && tournament.creator_id === user?.id)
    );
  
    return (
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold">Tournament Details</h2>
          {canEdit && !isEditing && (
            <Button
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Details
            </Button>
          )}
        </div>
  
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tournament Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Format</label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 rounded"
                >
                  <option value="SINGLE_ELIMINATION">Single Elimination</option>
                  <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                </select>
              </div>
            </div>
  
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Time (EST)</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 rounded"
                />
              </div>
            </div>
  
            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 rounded"
                placeholder="Describe your tournament..."
              />
            </div>
  
            {/* Rules */}
            <div>
              <label className="block text-sm font-medium mb-1">Rules</label>
              <textarea
                value={formData.rules}
                onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 rounded"
                placeholder="Tournament rules..."
              />
            </div>
  
            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Display sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Format</h3>
                <p className="font-medium">{tournament.format.replace('_', ' ')}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Team Size</h3>
                <p className="font-medium">{tournament.team_size} Players</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Teams</h3>
                <p className="font-medium">{tournament.current_teams}/{tournament.max_teams}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Status</h3>
                <p className="font-medium">{tournament.status}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Start Date</h3>
                <p className="font-medium">{new Date(tournament.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Start Time (EST)</h3>
                <p className="font-medium">{tournament.start_time}</p>
              </div>
            </div>
  
            {/* Description Section */}
            {tournament.description && (
              <div>
                <h3 className="text-sm text-gray-400 mb-2">Description</h3>
                <Card className="p-4 bg-gray-800">
                  <p className="whitespace-pre-wrap">{tournament.description}</p>
                </Card>
              </div>
            )}
  
            {/* Rules Section */}
            {tournament.rules && (
              <div>
                <h3 className="text-sm text-gray-400 mb-2">Rules</h3>
                <Card className="p-4 bg-gray-800">
                  <p className="whitespace-pre-wrap">{tournament.rules}</p>
                </Card>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

export default TournamentDetails; // Add the export 