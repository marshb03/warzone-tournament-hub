// src/components/tkr/TKRGameSubmissionForm.tsx - ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import { 
  Trophy, Target, Clock, AlertCircle, CheckCircle, ArrowLeft,
  Users, Calendar, Play
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import TeamSelectionDropdown from './TeamSelectionDropdown';
import { tkrService } from '../../services/tkr';
import { TKRTeamRegistration, TKRTournamentConfig, TKRGameSubmission } from '../../types/tkr';

interface EnhancedTKRGameSubmissionFormProps {
  tournamentId: number;
  onSubmissionComplete?: () => void;
}

interface GameForm {
  game_number: number;
  kills: string;
  placement: string;
  vod_url: string;
  timestamp: string;
}

const TKRGameSubmissionForm: React.FC<EnhancedTKRGameSubmissionFormProps> = ({
  tournamentId,
  onSubmissionComplete
}) => {
  // Team selection state
  const [selectedTeam, setSelectedTeam] = useState<TKRTeamRegistration | null>(null);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<any>(null);

  // Form state
  const [config, setConfig] = useState<TKRTournamentConfig | null>(null);
  const [games, setGames] = useState<GameForm[]>([]);
  const [existingSubmissions, setExistingSubmissions] = useState<TKRGameSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load tournament config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configData = await tkrService.getTournamentConfig(tournamentId);
        setConfig(configData);
      } catch (error) {
        console.error('Failed to load tournament config:', error);
        setError('Failed to load tournament configuration');
      }
    };

    loadConfig();
  }, [tournamentId]);

  // Handle team selection
  const handleTeamSelected = async (registration: TKRTeamRegistration) => {
    setSelectedTeam(registration);
    setError('');
    setSuccess('');

    try {
      // Check if user can submit scores for this team
      const status = await tkrService.canSubmitScoresForTeam(tournamentId, registration.id);
      setSubmissionStatus(status);
      setCanSubmit(status.can_submit);

      if (status.can_submit) {
        // Load existing submissions for this team
        const submissions = await tkrService.getSubmissionsForTeam(tournamentId, registration.id);
        setExistingSubmissions(submissions);

        // Initialize games form
        if (config) {
          const maxGames = config.best_games_count;
          const submittedGameNumbers = submissions.map(s => s.game_number);
          
          // Create form for remaining games
          const remainingSlots = maxGames - submissions.length;
          const initialGames: GameForm[] = [];
          
          for (let i = 0; i < Math.max(1, remainingSlots); i++) {
            let gameNumber = 1;
            while (submittedGameNumbers.includes(gameNumber)) {
              gameNumber++;
            }
            submittedGameNumbers.push(gameNumber);
            
            initialGames.push({
              game_number: gameNumber,
              kills: '',
              placement: '',
              vod_url: '',
              timestamp: ''
            });
          }
          
          setGames(initialGames);
        }
      }

      setShowScoreForm(true);
    } catch (error) {
      console.error('Failed to check submission status:', error);
      setError('Failed to load submission status for this team');
    }
  };

  // Calculate preview score for a game
  const calculatePreviewScore = (game: GameForm) => {
    if (!config || !selectedTeam || !game.kills || !game.placement) {
      return null;
    }

    const kills = parseInt(game.kills);
    const placement = parseInt(game.placement);
    
    if (isNaN(kills) || isNaN(placement)) return null;

    // Use the same scoring calculation as in the original form
    // This would need to import the calculation function
    return null; // Placeholder - implement based on your scoring logic
  };

  // Handle game form changes
  const handleGameChange = (index: number, field: keyof GameForm, value: string | number) => {
    const updatedGames = [...games];
    updatedGames[index] = {
      ...updatedGames[index],
      [field]: field === 'game_number' ? (value ? parseInt(value.toString()) : 1) : value
    };
    setGames(updatedGames);
  };

  // Add new game
  const addGame = () => {
    if (config && games.length < config.best_games_count - existingSubmissions.length) {
      const usedNumbers = [
        ...existingSubmissions.map(s => s.game_number),
        ...games.map(g => g.game_number)
      ];
      
      let nextGameNumber = 1;
      while (usedNumbers.includes(nextGameNumber)) {
        nextGameNumber++;
      }

      setGames([...games, {
        game_number: nextGameNumber,
        kills: '',
        placement: '',
        vod_url: '',
        timestamp: ''
      }]);
    }
  };

  // Remove game
  const removeGame = (index: number) => {
    const updatedGames = games.filter((_, i) => i !== index);
    setGames(updatedGames);
  };

  // Validate games
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

    // Check for conflicts with existing submissions
    const existingNumbers = existingSubmissions.map(s => s.game_number);
    const conflicts = gameNumbers.filter(num => existingNumbers.includes(num));
    if (conflicts.length > 0) {
      errors.push(`Game numbers ${conflicts.join(', ')} already submitted`);
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedTeam) {
      setError('Please select a team first');
      return;
    }

    const validationErrors = validateGames();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submissions = games.map(game => ({
        game_number: game.game_number,
        kills: parseInt(game.kills),
        placement: parseInt(game.placement),
        vod_url: game.vod_url,
        timestamp: game.timestamp
      }));

      await tkrService.submitGamesForTeam(tournamentId, selectedTeam.id, submissions);

      setSuccess(`Successfully submitted ${games.length} game${games.length > 1 ? 's' : ''} for ${selectedTeam.team_name}!`);
      
      // Reset form
      setGames([]);
      
      // Reload existing submissions
      const updatedSubmissions = await tkrService.getSubmissionsForTeam(tournamentId, selectedTeam.id);
      setExistingSubmissions(updatedSubmissions);

      if (onSubmissionComplete) {
        onSubmissionComplete();
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setError(error.response?.data?.detail || 'Failed to submit games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Submit Game Scores</h1>
        <p className="text-gray-400">
          Submit your competition results to the leaderboard
        </p>
      </div>

      {/* Team Selection Step */}
      {!showScoreForm && (
        <TeamSelectionDropdown
          tournamentId={tournamentId}
          onTeamSelected={handleTeamSelected}
          selectedTeam={selectedTeam}
          showSubmissionStatus={true}
        />
      )}

      {/* Score Submission Form - Only show when team is selected */}
      {showScoreForm && selectedTeam && (
        <div className="space-y-6">
          {/* Selected Team Header */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Submitting Scores for: {selectedTeam.team_name}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1" />
                    Rank: {selectedTeam.team_rank}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Players: {selectedTeam.players.length}
                  </span>
                  <span className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    ID: #{selectedTeam.id}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedTeam(null);
                  setShowScoreForm(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change Team
              </Button>
            </div>

            {/* Submission Status */}
            {submissionStatus && (
              <div className={`p-3 rounded-lg border ${
                canSubmit 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                <div className="flex items-center space-x-2">
                  {canSubmit ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-sm ${canSubmit ? 'text-green-300' : 'text-red-300'}`}>
                    {submissionStatus.message}
                  </span>
                </div>
                {submissionStatus.submission_deadline && (
                  <p className="text-xs text-gray-400 mt-1">
                    Deadline: {new Date(submissionStatus.submission_deadline).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Existing Submissions Summary */}
          {existingSubmissions.length > 0 && (
            <Card className="p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                Already Submitted ({existingSubmissions.length} games)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {existingSubmissions.map((submission, index) => (
                  <div key={submission.id} className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-400">Game {submission.game_number}</span>
                      <span className="text-sm text-gray-400">
                        {submission.final_score?.toFixed(1) || 'N/A'} pts
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      <p>{submission.kills} kills | #{submission.placement} place</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(submission.submitted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {config && existingSubmissions.length >= config.best_games_count && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-blue-300">
                      Maximum games submitted! Your top {config.best_games_count} scores will count toward the leaderboard.
                    </span>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Error/Success Messages */}
          {error && (
            <Card className="p-4 border-red-500/20 bg-red-500/10">
              <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </Card>
          )}

          {success && (
            <Card className="p-4 border-green-500/20 bg-green-500/10">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <p>{success}</p>
              </div>
            </Card>
          )}

          {/* Game Submission Form - Only show if can submit and hasn't reached max */}
          {canSubmit && config && existingSubmissions.length < config.best_games_count && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-white">
                  Submit New Games ({config.best_games_count - existingSubmissions.length} slots remaining)
                </h4>
                {games.length < (config.best_games_count - existingSubmissions.length) && (
                  <Button
                    variant="secondary"
                    onClick={addGame}
                    className="flex items-center"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Add Game
                  </Button>
                )}
              </div>

              {games.length === 0 && (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400 mb-4">No games added yet</p>
                  <Button variant="primary" onClick={addGame}>
                    Add Your First Game
                  </Button>
                </div>
              )}

              {/* Game Forms */}
              <div className="space-y-6">
                {games.map((game, index) => (
                  <div key={index} className="p-4 border border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-white">Game Entry {index + 1}</h5>
                      <Button
                        variant="ghost"
                        onClick={() => removeGame(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Game # *</label>
                        <input
                          type="number"
                          value={game.game_number}
                          onChange={(e) => handleGameChange(index, 'game_number', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                          min="1"
                          max="50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Kills *</label>
                        <input
                          type="number"
                          value={game.kills}
                          onChange={(e) => handleGameChange(index, 'kills', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                          min="0"
                          max="50"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Placement *</label>
                        <input
                          type="number"
                          value={game.placement}
                          onChange={(e) => handleGameChange(index, 'placement', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                          min="1"
                          max="150"
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">VOD URL *</label>
                        <input
                          type="url"
                          value={game.vod_url}
                          onChange={(e) => handleGameChange(index, 'vod_url', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                          placeholder="https://twitch.tv/..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Timestamp *</label>
                        <input
                          type="text"
                          value={game.timestamp}
                          onChange={(e) => handleGameChange(index, 'timestamp', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                          placeholder="1:23:45"
                        />
                      </div>
                    </div>

                    {/* Score Preview */}
                    {(() => {
                      const previewScore = calculatePreviewScore(game);
                      return previewScore ? (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-sm text-blue-400">
                            Estimated Score: <span className="font-semibold">{previewScore.toFixed(1)} points</span>
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              {games.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading}
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
                        Submit {games.length} Game{games.length > 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Competition Info */}
          {config && (
            <Card className="p-4 bg-gray-800/30">
              <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1 text-blue-400" />
                Tournament Rules Reminder
              </h4>
              <div className="text-xs text-gray-400 space-y-1">
                <p>• Your top {config.best_games_count} games will count toward your leaderboard score</p>
                <p>• You have 24 hours after your competition window ends to submit scores</p>
                <p>• All games must have valid VOD proof with timestamps</p>
                {config.max_points_per_map && (
                  <p>• Maximum {config.max_points_per_map} points per game</p>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default TKRGameSubmissionForm;