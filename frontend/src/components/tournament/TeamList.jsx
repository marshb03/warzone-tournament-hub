import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Edit2, Trash2, Users, Shuffle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';
import api from '../../services/api';

const TeamCard = ({ team, onEdit, onDelete, canManage }) => (
  <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
    <div>
      <div className="flex items-center space-x-3">
        <h3 className="font-semibold">{team.name}</h3>
        <span className="text-sm text-gray-400">
          Seed #{team.seed}
        </span>
      </div>
    </div>
    {canManage && (
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(team)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(team)}
          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )}
  </div>
);

const BulkAddTeamsModal = ({ onClose, onSubmit }) => {
  const [teamNames, setTeamNames] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const teams = teamNames.split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    onSubmit(teams);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Bulk Add Teams</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Enter Team Names (one per line)
            </label>
            <textarea
              value={teamNames}
              onChange={(e) => setTeamNames(e.target.value)}
              className="w-full h-48 p-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              placeholder="Team 1&#10;Team 2&#10;Team 3"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Teams
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const TeamList = ({ tournamentId, tournament }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamName, setTeamName] = useState('');
  const { user } = useAuth();

  const canManageTeams = user && (
    user.role === UserRole.SUPER_ADMIN || 
    (user.role === UserRole.HOST && tournament?.creator_id === user.id)
  );

  const showManagement = canManageTeams && tournament?.status === 'PENDING';

  // Add this function near the top of the TeamList component
  const handleShuffleTeams = async () => {
    try {
      // Get all team names in an array
      const teamNames = teams.map(team => team.name);
      
      // Shuffle the names using Fisher-Yates algorithm
      for (let i = teamNames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teamNames[i], teamNames[j]] = [teamNames[j], teamNames[i]];
      }
      
      // Update each team with a new name, maintaining their original seed
      const updates = teams.map((team, index) => 
        api.put(`/api/v1/teams/${team.id}`, {
          name: teamNames[index],
          seed: team.seed // Keep original seed
        })
      );
      
      await Promise.all(updates);
      await fetchTeams(); // Refresh the list
    } catch (err) {
      console.error('Failed to shuffle teams:', err);
      setError('Failed to shuffle team names');
    }
  };

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/teams/tournament/${tournamentId}`);
      setTeams(response.data);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleAddTeam = () => {
    setEditingTeam(null);
    setTeamName('');
    setIsModalOpen(true);
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setIsModalOpen(true);
  };

  const handleDeleteTeam = async (team) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await api.delete(`/api/v1/teams/${team.id}`);
        await fetchTeams();
      } catch (err) {
        console.error('Failed to delete team:', err);
        setError('Failed to delete team');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await api.put(`/api/v1/teams/${editingTeam.id}`, {
          name: teamName
        });
      } else {
        await api.post('/api/v1/teams/', {
          name: teamName,
          tournament_id: tournamentId
        });
      }
      setIsModalOpen(false);
      fetchTeams();
    } catch (err) {
      console.error('Failed to save team:', err);
      setError(err.response?.data?.detail || 'Failed to save team');
    }
  };

  const handleBulkSubmit = async (teamNames) => {
    try {
      for (const name of teamNames) {
        await api.post('/api/v1/teams/', {
          name,
          tournament_id: tournamentId
        });
      }
      await fetchTeams();
    } catch (err) {
      console.error('Failed to add teams:', err);
      setError('Failed to add teams');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading teams...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Teams</h2>
        {showManagement && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleAddTeam}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Bulk Add
            </Button>
            {teams.length > 1 && (
              <Button
                variant="secondary"
                onClick={handleShuffleTeams}
                className="flex items-center"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Shuffle Seeds
              </Button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {teams.length > 0 ? (
          teams.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              canManage={canManageTeams}
              onEdit={handleEditTeam}
              onDelete={handleDeleteTeam}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            No teams registered yet
          </div>
        )}
      </div>

      {/* Team Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingTeam ? 'Edit Team' : 'Add New Team'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full p-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingTeam ? 'Save Changes' : 'Add Team'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Bulk Add Teams Modal */}
      {isBulkModalOpen && (
        <BulkAddTeamsModal
          onClose={() => setIsBulkModalOpen(false)}
          onSubmit={handleBulkSubmit}
        />
      )}
    </div>
  );
};

export default TeamList;