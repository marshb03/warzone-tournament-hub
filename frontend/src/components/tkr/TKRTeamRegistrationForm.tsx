// src/components/tkr/TKRTeamRegistrationForm.tsx - Enhanced with Success Modal and Repositioned Calculator
import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, Calendar, AlertCircle, CheckCircle, UserPlus, Trash2,
  DollarSign, Calculator, Percent, CreditCard, Info
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import TKRRegistrationSuccessModal from '../modals/TKRRegistrationSuccessModal';
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

interface TKRTeamRegistrationFormProps {
  tournamentId: number;
  onRegistrationComplete?: (registration: any) => void;
  onCancel?: () => void;
}

const TKRTeamRegistrationForm: React.FC<TKRTeamRegistrationFormProps> = ({
  tournamentId,
  onRegistrationComplete,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<TKRTournamentConfig | null>(null);
  const [tournament, setTournament] = useState<any>(null);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);

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

  // FIXED: Calculate entry fee with hardcoded 50% rerun discount
  const calculateEntryFee = () => {
    if (!tournament?.entry_fee || tournament.entry_fee === 'Free') {
      return { 
        original: 0, 
        discount: 0, 
        final: 0, 
        showFree: true 
      };
    }

    // Parse the entry fee amount
    const baseAmount = parseFloat(tournament.entry_fee.replace('$', '')) || 0;
    let finalAmount = baseAmount;
    let totalDiscount = 0;

    // FIXED: Apply hardcoded 50% rerun discount
    if (formData.is_rerunning) {
      const rerunDiscount = baseAmount * 0.5; // Fixed: 50% discount hardcoded
      totalDiscount += rerunDiscount;
      finalAmount -= rerunDiscount;
    }

    // Apply free entry player discount
    if (formData.using_free_entry && formData.free_entry_players.length > 0) {
      const teamSize = TEAM_SIZE_CONFIG[config?.team_size || 'QUADS'].value;
      const perPlayerCost = baseAmount / teamSize;
      const freeEntryDiscount = perPlayerCost * formData.free_entry_players.length;
      totalDiscount += freeEntryDiscount;
      finalAmount -= freeEntryDiscount;
    }

    // Ensure final amount doesn't go below 0
    finalAmount = Math.max(0, finalAmount);

    return {
      original: baseAmount,
      discount: totalDiscount,
      final: finalAmount,
      showFree: false
    };
  };

  const entryFeeCalculation = calculateEntryFee();

  useEffect(() => {
    loadTournamentData();
  }, [tournamentId]);

  useEffect(() => {
    // Initialize players array when config loads
    if (config) {
      const playerCount = TEAM_SIZE_CONFIG[config.team_size].value;
      const initialPlayers = Array.from({ length: playerCount }, () => ({
        name: '',
        rank: null,
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

      // Set default start time to now
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setFormData(prev => ({ ...prev, start_time: localDateTime }));
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
      const tournamentEnd = new Date(tournament.end_date || tournament.start_date);
      
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
      [field]: field === 'rank' ? (typeof value === 'string' ? (parseInt(value) || null) : value) : value
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
      
      // Store registration result and show success modal
      setRegistrationResult(registration);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success modal handlers
  const handleModalClose = () => {
    setShowSuccessModal(false);
    if (onRegistrationComplete && registrationResult) {
      onRegistrationComplete(registrationResult);
    }
  };

  const handleViewTournament = () => {
    setShowSuccessModal(false);
    // Navigate to tournament page - you may need to import useNavigate if not already available
    window.location.href = `/tournaments/${tournamentId}`;
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
          <p>Failed to load tournament information. Please ensure the tournament is properly configured.</p>
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

      {/* Basic Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Team Name *</label>
            <input
              type="text"
              value={formData.team_name}
              onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, team_rank: e.target.value })}
              className={`w-full px-3 py-2 bg-gray-800 rounded-lg ${
                validationErrors.team_rank ? 'border border-red-500' : ''
              }`}
              placeholder="Auto-calculated from player ranks"
            />
            {validationErrors.team_rank && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.team_rank[0]}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Automatically calculated as sum of all player ranks
            </p>
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
                <p className="text-red-500 text-xs mt-2">{validationErrors[`player_${index}`][0]}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Start Time Selection */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Competition Schedule
        </h2>
        <div>
          <label className="block text-sm font-medium mb-2">Start Time *</label>
          <input
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            className={`w-full px-3 py-2 bg-gray-800 rounded-lg ${
              validationErrors.start_time ? 'border border-red-500' : ''
            }`}
          />
          {validationErrors.start_time && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.start_time[0]}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Choose when you want to start your {config.consecutive_hours}-hour competition window
          </p>
        </div>
      </Card>

      {/* Registration Options */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Registration Options</h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_rerunning"
              checked={formData.is_rerunning}
              onChange={(e) => setFormData({ ...formData, is_rerunning: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_rerunning" className="text-sm">
              This is a rerunning team (50% discount)
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="using_free_entry"
              checked={formData.using_free_entry}
              onChange={(e) => setFormData({ ...formData, using_free_entry: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="using_free_entry" className="text-sm">
              Using free entry for some players
            </label>
          </div>
        </div>

        {formData.using_free_entry && (
          <Card className="p-4 mt-4 bg-green-500/10 border-green-500/20">
            <h3 className="text-sm font-medium mb-3">Select Free Entry Players</h3>
            <div className="space-y-2">
              {players.filter(p => p.name.trim()).map((player) => (
                <label
                  key={player.name}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.free_entry_players.includes(player.name)}
                    onChange={() => handleFreeEntryPlayerToggle(player.name)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">
                    {player.name} {player.rank ? `(Rank: ${player.rank})` : ''}
                  </span>
                </label>
              ))}
            </div>
            {formData.free_entry_players.length === 0 && (
              <p className="text-yellow-400 text-xs mt-2">
                Please select which players are using free entries
              </p>
            )}
          </Card>
        )}
        
        {validationErrors.free_entry_players && (
          <p className="text-red-500 text-xs mt-2">{validationErrors.free_entry_players[0]}</p>
        )}
      </Card>

      {/* Payment Information - Multiple Methods */}
      {tournament.payment_methods && tournament.entry_fee !== 'Free' && entryFeeCalculation.final > 0 && (
        <Card className="p-6 bg-blue-500/10 border-blue-500/30">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-blue-400" />
            Payment Information
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {JSON.parse(tournament.payment_methods).map((method, index) => (
                <div key={index} className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-center">
                    <p className="text-sm text-blue-400 font-medium">{method.method}</p>
                    <p className="text-white font-semibold mt-1">{method.details}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {tournament.payment_instructions && (
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm text-blue-400 mb-1">Payment Instructions:</p>
                <p className="text-gray-300 text-sm">{tournament.payment_instructions}</p>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-yellow-400 text-sm font-medium">⚠️ Important:</p>
              <p className="text-gray-300 text-sm">
                Please send your payment of <strong>${entryFeeCalculation.final.toFixed(2)}</strong> using any of the above methods. 
                Include your team name "{formData.team_name || '[Team Name]'}" in the payment note.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* MOVED: Entry Fee Display - Now positioned at the bottom */}
      {!entryFeeCalculation.showFree && (
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-green-400" />
            Entry Fee Calculation
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Base Team Entry Fee:</span>
              <span className="text-white font-medium">${entryFeeCalculation.original.toFixed(2)}</span>
            </div>
            
            {/* FIXED: Hardcoded 50% rerun discount display */}
            {formData.is_rerunning && (
              <div className="flex justify-between items-center text-yellow-400">
                <span className="flex items-center">
                  <Percent className="h-4 w-4 mr-1" />
                  Rerun Discount (50%):
                </span>
                <span>-${(entryFeeCalculation.original * 0.5).toFixed(2)}</span>
              </div>
            )}
            
            {formData.using_free_entry && formData.free_entry_players.length > 0 && (
              <div className="flex justify-between items-center text-blue-400">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Free Entry Players ({formData.free_entry_players.length}):
                </span>
                <span>-${((entryFeeCalculation.original / teamSize.value) * formData.free_entry_players.length).toFixed(2)}</span>
              </div>
            )}
            
            {entryFeeCalculation.discount > 0 && (
              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Discounts:</span>
                  <span className="text-green-400 font-medium">-${entryFeeCalculation.discount.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-600 pt-3">
              <div className="flex justify-between items-center text-lg">
                <span className="text-white font-semibold">Final Amount Due:</span>
                <span className="text-green-400 font-bold text-xl">
                  {entryFeeCalculation.final === 0 ? 'FREE' : `$${entryFeeCalculation.final.toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tournament Rules Reminder */}
      <Card className="p-4 bg-gray-800/30">
        <h4 className="text-sm font-medium text-white mb-2 flex items-center">
          <Info className="h-4 w-4 mr-1 text-blue-400" />
          Tournament Rules Summary
        </h4>
        <div className="text-xs text-gray-400 space-y-1">
          <p>• You have {config.consecutive_hours} hours to play your {config.best_games_count} best games</p>
          <p>• Scoring: (Kills × Placement Multiplier) ÷ (Team Rank × 0.1) + Bonus Points</p>
          <p>• Your {config.best_games_count} highest-scoring games will count toward the leaderboard</p>
          {config.max_points_per_map && (
            <p>• Maximum {config.max_points_per_map} points per game</p>
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

      {/* SUCCESS MODAL - NEW ADDITION */}
      <TKRRegistrationSuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        registration={registrationResult}
        tournament={tournament}
        entryFeeCalculation={entryFeeCalculation}
        onViewTournament={handleViewTournament}
      />
    </div>
  );
};

export default TKRTeamRegistrationForm;