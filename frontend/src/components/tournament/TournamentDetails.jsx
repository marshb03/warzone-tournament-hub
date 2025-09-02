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
      end_date: tournament.end_date?.split('T')[0] || '', // Format end date for input
      end_time: tournament.end_time || '', // Add end_time field
      team_size: tournament.team_size,
      max_teams: tournament.max_teams,
      description: tournament.description || '',
      rules: tournament.rules || '',
      // New enhancement fields
      entry_fee: tournament.entry_fee || 'Free',
      entry_fee_amount: '',
      game: tournament.game || 'Call of Duty: Warzone',
      custom_game: '',
      game_mode: tournament.game_mode || 'Battle Royale',
      custom_game_mode: ''
    });

    // Game and game mode options
    const gameOptions = [
      'Call of Duty: Warzone',
      'Battlefield 6',
      'Black Ops 7',
      'Other'
    ];

    const gameModeOptions = [
      'Battle Royale',
      'Resurgence',
      'Multiplayer',
      'Other'
    ];

    // Initialize form data when editing starts
    React.useEffect(() => {
      if (isEditing) {
        // Parse entry fee
        if (tournament.entry_fee && tournament.entry_fee !== 'Free') {
          const amount = tournament.entry_fee.replace('$', '');
          setFormData(prev => ({
            ...prev,
            entry_fee: 'Paid',
            entry_fee_amount: amount
          }));
        }

        // Handle custom game
        if (tournament.game && !gameOptions.includes(tournament.game)) {
          setFormData(prev => ({
            ...prev,
            game: 'Other',
            custom_game: tournament.game
          }));
        }

        // Handle custom game mode
        if (tournament.game_mode && !gameModeOptions.includes(tournament.game_mode)) {
          setFormData(prev => ({
            ...prev,
            game_mode: 'Other',
            custom_game_mode: tournament.game_mode
          }));
        }
      }
    }, [isEditing, tournament]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          // Prepare update data
          const updateData = {
            name: formData.name,
            format: formData.format,
            start_date: formData.start_date,
            start_time: formData.start_time,
            end_date: formData.end_date,
            end_time: formData.end_time, // Include end_time
            team_size: parseInt(formData.team_size),
            max_teams: formData.format === 'TKR' ? null : parseInt(formData.max_teams), // No max teams for TKR
            description: formData.description,
            rules: formData.rules,
            // New enhancement fields
            entry_fee: getEntryFeeValue(),
            game: getGameValue(),
            game_mode: getGameModeValue()
          };

          await onUpdate(updateData);
          setIsEditing(false);
        } catch (error) {
          console.error('Failed to update tournament:', error);
        }
      };

    const getEntryFeeValue = () => {
      if (formData.entry_fee === 'Free') {
        return 'Free';
      }
      const amount = parseFloat(formData.entry_fee_amount);
      return isNaN(amount) ? 'Free' : `$${amount.toFixed(2)}`;
    };

    const getGameValue = () => {
      return formData.game === 'Other' ? formData.custom_game : formData.game;
    };

    const getGameModeValue = () => {
      return formData.game_mode === 'Other' ? formData.custom_game_mode : formData.game_mode;
    };

    const handleEntryFeeTypeChange = (e) => {
      const value = e.target.value;
      setFormData(prev => ({
        ...prev,
        entry_fee: value,
        entry_fee_amount: value === 'Free' ? '' : prev.entry_fee_amount
      }));
    };

    const handleEntryFeeAmountChange = (e) => {
      const value = e.target.value;
      // Only allow numbers and decimal point
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          entry_fee_amount: value
        }));
      }
    };

    const formatTournamentFormat = (format) => {
      switch(format) {
        case 'SINGLE_ELIMINATION': return 'Single Elimination';
        case 'DOUBLE_ELIMINATION': return 'Double Elimination';
        case 'TKR': return 'TKR';
        default: return format?.replace('_', ' ') || 'Single Elimination';
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
                  <option value="TKR">TKR</option>
                </select>
              </div>
            </div>

            {/* Game and Game Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Game</label>
                <select
                  value={formData.game}
                  onChange={(e) => setFormData(prev => ({ ...prev, game: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 rounded"
                >
                  {gameOptions.map(game => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
                {formData.game === 'Other' && (
                  <input
                    type="text"
                    value={formData.custom_game}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_game: e.target.value }))}
                    className="w-full px-3 py-2 mt-2 bg-gray-800 rounded"
                    placeholder="Enter custom game name"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Game Mode</label>
                <select
                  value={formData.game_mode}
                  onChange={(e) => setFormData(prev => ({ ...prev, game_mode: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 rounded"
                >
                  {gameModeOptions.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
                {formData.game_mode === 'Other' && (
                  <input
                    type="text"
                    value={formData.custom_game_mode}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_game_mode: e.target.value }))}
                    className="w-full px-3 py-2 mt-2 bg-gray-800 rounded"
                    placeholder="Enter custom game mode"
                  />
                )}
              </div>
            </div>

            {/* Entry Fee */}
            <div>
              <label className="block text-sm font-medium mb-1">Entry Fee</label>
              <div className="flex space-x-2">
                <select
                  value={formData.entry_fee}
                  onChange={handleEntryFeeTypeChange}
                  className="w-32 px-3 py-2 bg-gray-800 rounded"
                >
                  <option value="Free">Free</option>
                  <option value="Paid">Paid</option>
                </select>
                {formData.entry_fee === 'Paid' && (
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2 text-gray-400">$</span>
                    <input
                      type="text"
                      value={formData.entry_fee_amount}
                      onChange={handleEntryFeeAmountChange}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2 bg-gray-800 rounded"
                    />
                  </div>
                )}
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

            {/* TKR End Date and Time - Only show for TKR format */}
            {formData.format === 'TKR' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time (EST)</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  />
                </div>
              </div>
            )}

            {/* Team Size and Max Teams - Hide Max Teams for TKR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team Size</label>
                <select
                  value={formData.team_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, team_size: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 rounded"
                >
                  <option value={2}>2 Players</option>
                  <option value={3}>3 Players</option>
                  <option value={4}>4 Players</option>
                </select>
              </div>

              {/* Only show Max Teams for Single/Double Elimination */}
              {formData.format !== 'TKR' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Max Teams</label>
                  <input
                    type="number"
                    value={formData.max_teams}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_teams: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                    min="4"
                    max="32"
                  />
                </div>
              )}
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
                <p className="font-medium">{formatTournamentFormat(tournament.format)}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Team Size</h3>
                <p className="font-medium">{tournament.team_size} Players</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Game</h3>
                <p className="font-medium">{tournament.game || 'Call of Duty: Warzone'}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Game Mode</h3>
                <p className="font-medium">{tournament.game_mode || 'Battle Royale'}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Entry Fee</h3>
                <p className={`font-medium ${tournament.entry_fee && tournament.entry_fee !== 'Free' ? 'text-green-400' : ''}`}>
                  {tournament.entry_fee || 'Free'}
                </p>
              </div>
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Teams</h3>
                <p className="font-medium">
                  {tournament.format === 'TKR' ? 
                    `${tournament.current_teams} teams` : 
                    `${tournament.current_teams}/${tournament.max_teams}`
                  }
                </p>
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
              {/* Show end date/time for TKR tournaments */}
              {tournament.format === 'TKR' && tournament.end_date && (
                <>
                  <div>
                    <h3 className="text-sm text-gray-400 mb-1">End Date</h3>
                    <p className="font-medium">{new Date(tournament.end_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-400 mb-1">End Time (EST)</h3>
                    <p className="font-medium">{tournament.end_time || 'Not specified'}</p>
                  </div>
                </>
              )}
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

export default TournamentDetails;