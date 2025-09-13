// src/components/tkr/TKRTeamRegistration.tsx
import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { tkrService } from '../../services/tkr';
import { tournamentService } from '../../services/tournament';
import {
  TKRPlayer,
  TKRTeamRegistrationCreate,
  TKRTournamentConfig,
  TEAM_SIZE_CONFIG,
  validateTKRPlayer,
  validateTeamRank
} from '../../types/tkr';

interface TKRTeamRegistrationProps {
  tournamentId: number;
  onRegistrationComplete?: (registration: any) => void;
  onCancel?: () => void;
}

const TKRTeamRegistration: React.FC<TKRTeamRegistrationProps> = ({
  tournamentId,
  onRegistrationComplete,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<TKRTournamentConfig | null>(null);
  const [tournament, setTournament] = useState<any>(null);

  const [formData, setFormData] = useState({
    team_name: '',
    team_rank: '',
    start_time: '',
    is_rerunning: false,
    using_free_entry: false,
    free_entry_players: [] as string[]
  });

  const [players, setPlayers] = useState<TKRPlayer[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    loadTournamentData();
  }, [tournamentId]);

  useEffect(() => {
    // Initialize players array when config loads
    if (config) {
      const playerCount = TEAM_SIZE_CONFIG[config.team_size].value;
      const initialPlayers = Array.from({ length: playerCount }, () => ({
        name: '',
        rank: 0,
        stream: ''
      }));
      setPlayers(initialPlayers);
    }
  }, [config]);

  useEffect(() => {
    // Auto-calculate team rank when player ranks change
    const totalRank = players.reduce((sum, player) => sum + (player.rank || 0), 0);
    if (totalRank > 0) {
      setFormData(prev => ({ ...prev, team_rank: totalRank.toString() }));
    }
  }, [players]);

  const loadTournamentData = async () => {
    try {
      setLoading(true);
      const [tournamentData, configData] = await Promise.all([
        tournamentService.getTournamentById(tournamentId),
        tkrService.getTournamentConfig(tournamentId)
      ]);
      
      setTournament(tournamentData);
      setConfig(configData);
    } catch (error) {
      console.error('Failed to load tournament data:', error);
      setError('Failed to load tournament information');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string[] } = {};

    // Validate team name
    if (!formData.team_name.trim()) {
      errors.team_name = ['Team name is required'];
    }

    // Validate team rank
    const teamRank = parseInt(formData.team_rank);
    if (!teamRank || teamRank < 1) {
      errors.team_rank = ['Team rank must be a positive number'];
    } else if (!validateTeamRank(players, teamRank)) {
      errors.team_rank = ['Team rank must equal the sum of all player ranks'];
    }

    // Validate start time
    if (!formData.start_time) {
      errors.start_time = ['Start time is required'];
    } else if (tournament) {
      const startTime = new Date(formData.start_time);
      const tournamentStart = new Date(tournament.start_date);
      const tournamentEnd = new Date(tournament.end_date);
      
      if (startTime < tournamentStart || startTime > tournamentEnd) {
        errors.start_time = ['Start time must be within tournament dates'];
      }
    }

    // Validate players
    players.forEach((player, index) => {
      const playerErrors = validateTKRPlayer(player);
      if (playerErrors.length > 0) {
        errors[`player_${index}`] = playerErrors;
      }
    });

    // Validate free entry players
    if (formData.using_free_entry && formData.free_entry_players.length === 0) {
      errors.free_entry_players = ['Must specify which players are using free entry'];
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlayerChange = (index: number, field: keyof TKRPlayer, value: string | number) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = {
      ...updatedPlayers[index],
      [field]: field === 'rank' ? (typeof value === 'string' ? parseInt(value) || 0 : value) : value
    };
    setPlayers(updatedPlayers);
  };

  const handleFreeEntryPlayerToggle = (playerName: string) => {
    const currentPlayers = formData.free_entry_players;
    const isSelected = currentPlayers.includes(playerName);
    
    if (isSelected) {
      setFormData({
        ...formData,
        free_entry_players: currentPlayers.filter(name => name !== playerName)
      });
    } else {
      setFormData({
        ...formData,
        free_entry_players: [...currentPlayers, playerName]
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const registrationData: TKRTeamRegistrationCreate = {
        tournament_id: tournamentId,
        team_name: formData.team_name,
        team_rank: parseInt(formData.team_rank),
        players: players,
        start_time: formData.start_time,
        is_rerunning: formData.is_rerunning,
        using_free_entry: formData.using_free_entry,
        free_entry_players: formData.using_free_entry ? formData.free_entry_players : undefined
      };

      const registration = await tkrService.registerTeam(tournamentId, registrationData);
      
      if (onRegistrationComplete) {
        onRegistrationComplete(registration);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !config) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2979FF]" />
          <span className="ml-2">Loading tournament information...</span>
        </div>
      </Card>
    );
  }

  if (!config || !tournament) {
    return (
      <Card className="p-6 border-red-500/20">
        <div className="flex items-center space-x-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load tournament information</p>
        </div>
      </Card>
    );
  }

  const teamSize = TEAM_SIZE_CONFIG[config.team_size];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Register for TKR Tournament</h1>
        <p className="text-gray-400">{tournament.name}</p>
      </div>

      {error && (
        <Card className="p-4 border-red-500/20 bg-red-500/10">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-500">{error}</p>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {/* Tournament Info */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Tournament Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-[#2979FF]" />
              <span>{teamSize.label} ({teamSize.value} players)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-[#2979FF]" />
              <span>{config.consecutive_hours} hour time window</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-[#2979FF]" />
              <span>{config.tournament_days} day tournament</span>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
            <h3 className="font-semibold mb-2">Map: {config.map_name}</h3>
            <p className="text-sm text-gray-400">
              Submit your best {config.best_games_count} games from your {config.consecutive_hours}-hour window
            </p>
          </div>
        </Card>

        {/* Team Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Team Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Team Name *</label>
              <input
                type="text"
                value={formData.team_name}
                onChange={(e) => setFormData({...formData, team_name: e.target.value})}
                className={`w-full px-3 py-2 bg-gray-800 rounded-lg ${
                  validationErrors.team_name ? 'border border-red-500' : ''
                }`}
                placeholder="Enter your team name"
              />
              {validationErrors.team_name && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.team_name[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Team Rank *</label>
              <input
                type="number"
                value={formData.team_rank}
                onChange={(e) => setFormData({...formData, team_rank: e.target.value})}
                className={`w-full px-3 py-2 bg-gray-800 rounded-lg ${
                  validationErrors.team_rank ? 'border border-red-500' : ''
                }`}
                placeholder="Sum of all player ranks"
                min="1"
              />
              {validationErrors.team_rank && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.team_rank[0]}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Player Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Player Information</h2>
          <div className="space-y-4">
            {players.map((player, index) => (
              <div key={index} className="p-4 border border-gray-700 rounded-lg">
                <h3 className="font-medium mb-3">Player {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-800 rounded-lg ${
                        validationErrors[`player_${index}`] ? 'border border-red-500' : ''
                      }`}
                      placeholder="Player name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rank *</label>
                    <input
                      type="number"
                      value={player.rank || ''}
                      onChange={(e) => handlePlayerChange(index, 'rank', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-800 rounded-lg ${
                        validationErrors[`player_${index}`] ? 'border border-red-500' : ''
                      }`}
                      placeholder="Player rank"
                      min="1"
                      max="9999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stream URL *</label>
                    <input
                      type="url"
                      value={player.stream}
                      onChange={(e) => handlePlayerChange(index, 'stream', e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-800 rounded-lg ${
                        validationErrors[`player_${index}`] ? 'border border-red-500' : ''
                      }`}
                      placeholder="https://twitch.tv/username"
                    />
                  </div>
                </div>
                {validationErrors[`player_${index}`] && (
                  <div className="mt-2">
                    {validationErrors[`player_${index}`].map((error, errorIndex) => (
                      <p key={errorIndex} className="text-red-500 text-xs">{error}</p>
                    ))}
                  </div>
                )}
                
                {/* Free Entry Toggle */}
                {formData.using_free_entry && player.name && (
                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.free_entry_players.includes(player.name)}
                        onChange={() => handleFreeEntryPlayerToggle(player.name)}
                        className="mr-2"
                      />
                      <span className="text-sm">This player is using a free entry</span>
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Schedule and Options */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Schedule & Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Time (EST) *</label>
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                className={`w-full px-3 py-2 bg-gray-800 rounded-lg ${
                  validationErrors.start_time ? 'border border-red-500' : ''
                }`}
                min={tournament.start_date.split('T')[0] + 'T00:00'}
                max={tournament.end_date.split('T')[0] + 'T23:59'}
              />
              {validationErrors.start_time && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.start_time[0]}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Your {config.consecutive_hours}-hour window will start at this time
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_rerunning}
                    onChange={(e) => setFormData({...formData, is_rerunning: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">This is a rerun (50% discount)</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.using_free_entry}
                    onChange={(e) => setFormData({
                      ...formData, 
                      using_free_entry: e.target.checked,
                      free_entry_players: e.target.checked ? formData.free_entry_players : []
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm">Using free entry</span>
                </label>
              </div>
            </div>
          </div>
          
          {validationErrors.free_entry_players && (
            <p className="text-red-500 text-xs mt-2">{validationErrors.free_entry_players[0]}</p>
          )}
        </Card>

        {/* Entry Fee Display */}
        <Card className="p-6 bg-gray-800/50">
          <h3 className="font-semibold mb-2">Entry Fee Calculation</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Base Entry Fee:</span>
              <span>{tournament.entry_fee}</span>
            </div>
            {formData.is_rerunning && (
              <div className="flex justify-between text-green-400">
                <span>Rerun Discount (50%):</span>
                <span>-50%</span>
              </div>
            )}
            {formData.using_free_entry && (
              <div className="flex justify-between text-blue-400">
                <span>Free Entry Players:</span>
                <span>{formData.free_entry_players.length} players</span>
              </div>
            )}
          </div>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            disabled={loading}
            onClick={handleSubmit}
            className="flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Registering...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Register Team
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TKRTeamRegistration;