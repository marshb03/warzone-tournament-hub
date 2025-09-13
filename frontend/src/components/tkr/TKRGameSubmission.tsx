// src/components/tkr/TKRGameSubmission.tsx
import React, { useState, useEffect } from 'react';
import { Upload, Calendar, Clock, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { tkrService } from '../../services/tkr';
import { 
  TKRGameSubmissionCreate, 
  TKRTournamentConfig,
  TKRTeamRegistration,
  calculateGameScore 
} from '../../types/tkr';

interface TKRGameSubmissionProps {
  tournamentId: number;
  teamRegistrationId: number;
  onSubmissionComplete?: () => void;
}

interface GameForm {
  game_number: number;
  kills: string;
  placement: string;
  vod_url: string;
  timestamp: string;
}

const TKRGameSubmission: React.FC<TKRGameSubmissionProps> = ({
  tournamentId,
  teamRegistrationId,
  onSubmissionComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<TKRTournamentConfig | null>(null);
  const [registration, setRegistration] = useState<TKRTeamRegistration | null>(null);
  const [games, setGames] = useState<GameForm[]>([]);

  useEffect(() => {
    loadData();
  }, [tournamentId, teamRegistrationId]);

  const loadData = async () => {
    try {
      const [configData, registrationData] = await Promise.all([
        tkrService.getTournamentConfig(tournamentId),
        tkrService.getTournamentRegistrations(tournamentId)
      ]);
      
      setConfig(configData);
      const teamReg = registrationData.find(r => r.id === teamRegistrationId);
      setRegistration(teamReg || null);

      // Initialize game forms based on best_games_count
      if (configData) {
        const initialGames = Array.from({ length: configData.best_games_count }, (_, i) => ({
          game_number: i + 1,
          kills: '',
          placement: '',
          vod_url: '',
          timestamp: ''
        }));
        setGames(initialGames);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load tournament data');
    }
  };

  const updateGame = (index: number, field: keyof GameForm, value: string) => {
    const updatedGames = [...games];
    updatedGames[index] = { ...updatedGames[index], [field]: value };
    setGames(updatedGames);
  };

  const addGame = () => {
    if (config && games.length < config.best_games_count) {
      setGames([...games, {
        game_number: games.length + 1,
        kills: '',
        placement: '',
        vod_url: '',
        timestamp: ''
      }]);
    }
  };

  const removeGame = (index: number) => {
    const updatedGames = games.filter((_, i) => i !== index);
    // Renumber games
    const renumberedGames = updatedGames.map((game, i) => ({
      ...game,
      game_number: i + 1
    }));
    setGames(renumberedGames);
  };

  const calculatePreviewScore = (game: GameForm) => {
    if (!config || !registration || !game.kills || !game.placement) {
      return null;
    }

    const kills = parseInt(game.kills);
    const placement = parseInt(game.placement);
    
    if (isNaN(kills) || isNaN(placement)) return null;

    return calculateGameScore(
      kills,
      placement,
      registration.team_rank,
      config.placement_multipliers,
      config.bonus_point_thresholds,
      config.max_points_per_map
    );
  };

  const validateGames = (): string[] => {
    const errors: string[] = [];
    
    if (games.length === 0) {
      errors.push('At least one game must be submitted');
      return errors;
    }

    games.forEach((game, index) => {
      if (!game.kills || isNaN(parseInt(game.kills))) {
        errors.push(`Game ${index + 1}: Valid kill count required`);
      }
      if (!game.placement || isNaN(parseInt(game.placement))) {
        errors.push(`Game ${index + 1}: Valid placement required`);
      }
      if (!game.vod_url || !game.vod_url.match(/^https?:\/\/.+/)) {
        errors.push(`Game ${index + 1}: Valid VOD URL required`);
      }
      if (!game.timestamp.trim()) {
        errors.push(`Game ${index + 1}: Timestamp required`);
      }
    });

    // Check for duplicate game numbers
    const gameNumbers = games.map(g => g.game_number);
    const duplicates = gameNumbers.filter((num, index) => gameNumbers.indexOf(num) !== index);
    if (duplicates.length > 0) {
      errors.push('Duplicate game numbers found');
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateGames();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submissions = games.map(game => ({
        game_number: game.game_number,
        kills: parseInt(game.kills),
        placement: parseInt(game.placement),
        vod_url: game.vod_url,
        timestamp: game.timestamp
      }));

      await tkrService.submitGames(tournamentId, {
        team_registration_id: teamRegistrationId,
        games: submissions
      });

      if (onSubmissionComplete) {
        onSubmissionComplete();
      }
    } catch (error) {
      console.error('Failed to submit games:', error);
      setError(error.response?.data?.detail || 'Failed to submit games');
    } finally {
      setLoading(false);
    }
  };

  if (!config || !registration) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2979FF]" />
          <span className="ml-2">Loading...</span>
        </div>
      </Card>
    );
  }

  const timeWindowEnd = registration.end_time ? new Date(registration.end_time) : null;
  const canSubmit = !timeWindowEnd || new Date() <= timeWindowEnd;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Submit Games</h1>
            <p className="text-gray-400">Team: {registration.team_name}</p>
          </div>
          <div className="text-right">
            {timeWindowEnd && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className={canSubmit ? 'text-yellow-400' : 'text-red-400'}>
                  Window ends: {timeWindowEnd.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tournament Info */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Map: </span>
            <span className="text-white font-medium">{config.map_name}</span>
          </div>
          <div>
            <span className="text-gray-400">Required Games: </span>
            <span className="text-white font-medium">{config.best_games_count}</span>
          </div>
          <div>
            <span className="text-gray-400">Team Rank: </span>
            <span className="text-white font-medium">{registration.team_rank}</span>
          </div>
        </div>
      </Card>

      {/* Submission Window Warning */}
      {!canSubmit && (
        <Card className="p-4 border-yellow-500/20 bg-yellow-500/10">
          <div className="flex items-center space-x-2 text-yellow-500">
            <AlertCircle className="h-5 w-5" />
            <p>Your submission window has ended, but you have a 24-hour grace period</p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-4 border-red-500/20 bg-red-500/10">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {/* Game Submission Forms */}
      <div className="space-y-4">
        {games.map((game, index) => (
          <Card key={index} className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Game {game.game_number}</h3>
              {games.length > 1 && (
                <Button
                  variant="ghost"
                  onClick={() => removeGame(index)}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kills *</label>
                <input
                  type="number"
                  value={game.kills}
                  onChange={(e) => updateGame(index, 'kills', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  placeholder="Enter kill count"
                  min="0"
                  max="200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Placement *</label>
                <input
                  type="number"
                  value={game.placement}
                  onChange={(e) => updateGame(index, 'placement', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  placeholder="Final placement"
                  min="1"
                  max="150"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">VOD URL *</label>
                <input
                  type="url"
                  value={game.vod_url}
                  onChange={(e) => updateGame(index, 'vod_url', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  placeholder="https://twitch.tv/videos/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Timestamp *</label>
                <input
                  type="text"
                  value={game.timestamp}
                  onChange={(e) => updateGame(index, 'timestamp', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  placeholder="e.g., 1:23:45 or 5m30s"
                />
              </div>
            </div>

            {/* Score Preview */}
            {(() => {
              const scorePreview = calculatePreviewScore(game);
              return scorePreview && (
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Score Preview</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Base Score: </span>
                      <span className="text-white">{scorePreview.baseScore.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Bonus Points: </span>
                      <span className="text-green-400">+{scorePreview.bonusPoints}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Final Score: </span>
                      <span className="text-[#2979FF] font-bold">{scorePreview.finalScore.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        ))}
      </div>

      {/* Add Game Button */}
      {config && games.length < config.best_games_count && (
        <div className="text-center">
          <Button
            variant="secondary"
            onClick={addGame}
            className="flex items-center mx-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            Add Another Game ({games.length}/{config.best_games_count})
          </Button>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || games.length === 0}
          className="flex items-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit {games.length} Game{games.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>

      {/* Submission Guidelines */}
      <Card className="p-4 bg-gray-800/30">
        <h4 className="font-medium mb-2">Submission Guidelines</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Submit your best {config.best_games_count} games from your time window</li>
          <li>• VOD URLs must be accessible for verification</li>
          <li>• Timestamps should indicate when the game starts</li>
          <li>• All submissions are initially pending host verification</li>
          <li>• You have a 24-hour grace period after your time window ends</li>
        </ul>
      </Card>
    </div>
  );
};

export default TKRGameSubmission;