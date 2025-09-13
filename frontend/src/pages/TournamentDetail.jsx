// src/pages/TournamentDetail.jsx - Updated with TKR Configuration Tab
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Users, 
  Trophy, 
  Calendar, 
  Clock, 
  AlertCircle,
  Table,
  Edit2,
  Target,
  Map,
  Timer,
  DollarSign,
  Settings,
  CheckCircle,
  X,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tournamentService } from '../services/tournament';
import { tkrService } from '../services/tkr';
import api from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import TeamList from '../components/tournament/TeamList';
import WinnersBracket from '../components/tournament/WinnersBracket';
import LosersBracket from '../components/tournament/LosersBracket';
import MatchUpdateModal from '../components/tournament/MatchUpdateModal';
import Leaderboard from '../components/tournament/Leaderboard';
import TournamentDetails from '../components/tournament/TournamentDetails';
import VictoryModal from '../components/common/VictoryModal';
import PageBackground from '../components/backgrounds/PageBackground';

// Import TKR components
import TKRLeaderboard from '../components/tkr/TKRLeaderboard';
import TKRHostDashboard from '../components/tkr/TKRHostDashboard';
import TKRTournamentConfiguration from '../components/tkr/TKRTournamentConfiguration';
import TKRGameSubmissionForm from '../components/tkr/TKRGameSubmissionForm';

import cache from '../utils/cache';

// Toast component for notifications
const Toast = ({ message, type = 'info', onClose }) => {
  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    } text-white z-50`}>
      <div className="flex items-center">
        <span>{message}</span>
        <button 
          onClick={onClose} 
          className="ml-4 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Setup Required Modal for TKR tournaments
const TKRSetupModal = ({ isOpen, onClose, onSetup }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card className="p-6 max-w-md w-full bg-gray-900 border border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <Settings className="h-6 w-6 text-[#2979FF] mr-2" />
            <h2 className="text-xl font-bold text-white">TKR Configuration Required</h2>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-300">
            This TKR tournament needs to be configured before it can go live. 
            You'll need to set up:
          </p>
          
          <ul className="text-sm space-y-2 text-gray-400">
            <li className="flex items-center">
              <Target className="h-4 w-4 mr-2 text-[#2979FF]" />
              Map name and team size
            </li>
            <li className="flex items-center">
              <Timer className="h-4 w-4 mr-2 text-[#2979FF]" />
              Time windows and tournament duration
            </li>
            <li className="flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-[#2979FF]" />
              Scoring rules and placement multipliers
            </li>
            <li className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-[#2979FF]" />
              Prize pool and host percentage
            </li>
          </ul>
          
          <div className="flex space-x-3 pt-4">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Configure Later
            </Button>
            <Button variant="primary" onClick={onSetup} className="flex-1">
              Configure Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const statusStyles = {
  PENDING: 'bg-yellow-500/20 text-yellow-500',
  ONGOING: 'bg-green-500/20 text-green-500',
  COMPLETED: 'bg-blue-500/20 text-blue-500',
  CANCELLED: 'bg-red-500/20 text-red-500'
};

const TabButton = ({ active, onClick, children, count, disabled = false }) => (
  <button
    className={`px-4 py-2 font-medium rounded-lg transition-colors flex items-center ${
      disabled 
        ? 'text-gray-600 cursor-not-allowed' 
        : active 
        ? 'bg-[#2979FF] text-white' 
        : 'text-gray-400 hover:bg-gray-800'
    }`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
    {count !== undefined && (
      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
        active ? 'bg-white/20' : 'bg-gray-700'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Tournament and match states
  const [tournament, setTournament] = useState(null);
  const [tkrDetails, setTkrDetails] = useState(null);
  const [tkrConfig, setTkrConfig] = useState(null);
  const [tkrConfigExists, setTkrConfigExists] = useState(false);
  const [winnerMatches, setWinnerMatches] = useState([]);
  const [loserMatches, setLoserMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [userRegistration, setUserRegistration] = useState(null);
  const [canSubmitScores, setCanSubmitScores] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bracket');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [victoryTeam, setVictoryTeam] = useState(null);

  const showToast = ({ message, type = 'info' }) => {
    setToast({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 5000);
  };

  const canManageTournament = user && (
    user.role === 'SUPER_ADMIN' || 
    (user.role === 'HOST' && tournament?.creator_id === user.id)
  );

  const isTKR = tournament?.format === 'TKR';

  const checkSubmissionPermission = async () => {
    if (!isTKR || !user) return;
    
    try {
      // Just check if user has ANY registrations
      const registrations = await tkrService.getMyRegistrations(parseInt(id));
      setCanSubmitScores(registrations.length > 0);
      if (registrations.length > 0) {
        // Set the most recent registration for backwards compatibility
        setUserRegistration(registrations[0]);
      }
    } catch (error) {
      console.log('User not registered for tournament');
      setCanSubmitScores(false);
    }
  };

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tournament details
        const tournamentData = await tournamentService.getTournamentById(id);
        setTournament(tournamentData);

        // Handle different tournament formats
        if (tournamentData.format === 'TKR') {
          // Set default tab to leaderboard for TKR tournaments
          setActiveTab('leaderboard');
          
          try {
            // Try to get TKR configuration
            const config = await tkrService.getTournamentConfig(id);
            setTkrConfig(config);
            setTkrConfigExists(true);
            
            // If config exists, try to get full details
            try {
              const tkrData = await tkrService.getTournamentDetails(id);
              setTkrDetails(tkrData);
            } catch (detailsError) {
              console.log('TKR details not available yet');
            }
          } catch (configError) {
            console.log('TKR configuration not found');
            setTkrConfigExists(false);
            
            // Show setup modal if user can manage tournament
            if (canManageTournament) {
              setShowSetupModal(true);
            }
          }
        } else {
          // Regular tournament - load bracket data if not pending
          if (tournamentData.status !== 'PENDING') {
            const matchesData = await tournamentService.getTournamentMatches(id);
            
            setWinnerMatches([
              ...(matchesData.winners_bracket || []),
              ...(matchesData.finals || [])
            ]);
            
            if (tournamentData.format === 'DOUBLE_ELIMINATION') {
              setLoserMatches(matchesData.losers_bracket || []);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching tournament data:', err);
        setError('Failed to load tournament details');
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, [id, canManageTournament]);

  useEffect(() => {
    if (tournament && isTKR && user) {
      checkSubmissionPermission();
    }
  }, [tournament, isTKR, user]);

  const handleTournamentUpdate = async (updatedData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update tournament via service
      await tournamentService.updateTournament(id, updatedData);
      
      // Fetch updated tournament data
      const updatedTournament = await tournamentService.getTournamentById(id);
      setTournament(updatedTournament);

      showToast({
        message: 'Tournament updated successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to update tournament:', error);
      setError('Failed to update tournament. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTKRConfigurationComplete = async (config) => {
    setTkrConfig(config);
    setTkrConfigExists(true);
    setShowSetupModal(false);
    
    // Refresh TKR details
    try {
      const tkrData = await tkrService.getTournamentDetails(id);
      setTkrDetails(tkrData);
    } catch (error) {
      console.log('TKR details not available yet');
    }

    showToast({
      message: 'TKR configuration saved successfully!',
      type: 'success'
    });
  };

  const handleStartTournament = async () => {
    // For TKR tournaments, check if configuration exists
    if (isTKR && !tkrConfigExists) {
      setShowSetupModal(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await api.post(`/api/v1/tournaments/${id}/start`);
      cache.clear('upcoming-tournaments');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const [updatedTournament, matchesData] = await Promise.all([
        tournamentService.getTournamentById(id),
        !isTKR ? tournamentService.getTournamentMatches(id) : Promise.resolve(null)
      ]);
      
      setTournament(updatedTournament);
      
      if (!isTKR && matchesData) {
        if (updatedTournament.format === 'DOUBLE_ELIMINATION') {
          setWinnerMatches([
            ...(matchesData.winners_bracket || []),
            ...(matchesData.finals || [])
          ]);
          setLoserMatches(matchesData.losers_bracket || []);
        } else {
          setWinnerMatches(matchesData.winners_bracket || []);
        }
      }

      showToast({
        message: 'Tournament started successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to start tournament:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to start tournament. Please try again.';
      setError(`Error starting tournament: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetTournament = async () => {
    if (!window.confirm('Are you sure you want to reset this tournament? This will clear all matches and results.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await api.post(`/api/v1/tournaments/${id}/reset`);
      
      const updatedTournament = await tournamentService.getTournamentById(id);
      setTournament(updatedTournament);
      
      if (!isTKR) {
        setWinnerMatches([]);
        setLoserMatches([]);
      }

      showToast({
        message: 'Tournament reset successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to reset tournament:', error);
      setError('Failed to reset tournament. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // TKR-specific content rendering
  const renderTKRContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="space-y-6">
            {/* Basic Tournament Details */}
            <TournamentDetails
              tournament={tournament}
              onUpdate={handleTournamentUpdate}
              canManage={canManageTournament}
              tkrConfig={tkrConfig}                    
              prizePool={tkrDetails?.prize_pool}       
              appliedTemplate="Template Name"          
            />

            {/* Configuration Required Warning */}
            {!tkrConfigExists && canManageTournament && (
              <Card className="p-4 border-yellow-500/20 bg-yellow-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-yellow-500">
                    <AlertCircle className="h-5 w-5" />
                    <p>TKR configuration required before tournament can go live</p>
                  </div>
                  <Button 
                    variant="secondary"
                    onClick={() => setActiveTab('tkr-config')}
                    className="flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Now
                  </Button>
                </div>
              </Card>
            )}
          </div>
        );

      case 'teams':
        if (isTKR) {
          return (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Team Registrations</h2>
              <div className="text-center py-8">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 mb-4">
                  {tkrDetails?.total_registrations || 0} teams registered
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/tournaments/${id}/register-tkr`)}
                  disabled={
                    // FIXED: Allow registration for both PENDING and ONGOING TKR tournaments
                    !['PENDING', 'ONGOING'].includes(tournament?.status) || 
                    !tkrConfigExists
                  }
                  className="flex items-center mx-auto"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Register Team for TKR
                </Button>
                {!['PENDING', 'ONGOING'].includes(tournament?.status) && (
                  <p className="text-sm text-gray-400 mt-2">
                    Registration is closed for this tournament
                  </p>
                )}
                {!tkrConfigExists && (
                  <p className="text-sm text-gray-400 mt-2">
                    Tournament must be configured before registration
                  </p>
                )}
              </div>
            </Card>
          );
        } else {
          // Original logic for non-TKR tournaments
          return (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Team Registrations</h2>
              <div className="text-center py-8">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 mb-4">
                  {tournament?.current_teams || 0} teams registered
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/tournaments/${id}/register`)}
                  disabled={tournament?.status !== 'PENDING'}
                  className="flex items-center mx-auto"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Register Team
                </Button>
                {tournament?.status !== 'PENDING' && (
                  <p className="text-sm text-gray-400 mt-2">
                    Registration is closed for this tournament
                  </p>
                )}
              </div>
            </Card>
          );
        }
      
      case 'bracket':
        return (
          <Card className="p-6 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400">
              TKR tournaments use a leaderboard system instead of brackets
            </p>
            <Button
              variant="secondary"
              onClick={() => setActiveTab('leaderboard')}
              className="mt-4"
            >
              View Live Leaderboard
            </Button>
          </Card>
        );
      
      case 'leaderboard':
        return tkrConfigExists ? (
          <TKRLeaderboard tournamentId={parseInt(id)} />
        ) : (
          <Card className="p-6 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 mb-4">
              Leaderboard will be available once TKR configuration is complete
            </p>
            {canManageTournament && (
              <Button
                variant="primary"
                onClick={() => setActiveTab('tkr-config')}
              >
                Configure Tournament
              </Button>
            )}
          </Card>
        );

      case 'submit-scores':
        return canSubmitScores && userRegistration ? (
          <TKRGameSubmissionForm
            tournamentId={parseInt(id)}
            teamRegistrationId={userRegistration.id}
            onSubmissionComplete={() => {
              showToast({
                message: 'Game scores submitted successfully',
                type: 'success'
              });
            }}
          />
        ) : (
          <Card className="p-6 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Score Submission Unavailable</h3>
            <p className="text-gray-400">
              You must be registered for this tournament to submit scores.
            </p>
          </Card>
        );

      case 'host-dashboard':
        return canManageTournament ? (
          tkrConfigExists ? (
            <TKRHostDashboard tournamentId={parseInt(id)} tournament={tournament} />
          ) : (
            <Card className="p-6 text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 mb-4">
                Complete TKR configuration to access host dashboard
              </p>
              <Button
                variant="primary"
                onClick={() => setActiveTab('tkr-config')}
              >
                Configure Tournament
              </Button>
            </Card>
          )
        ) : (
          <Card className="p-6">
            <p className="text-gray-400">Host dashboard access required</p>
          </Card>
        );

      case 'tkr-config':
        return canManageTournament ? (
          <TKRTournamentConfiguration 
            tournamentId={parseInt(id)}
            onConfigurationComplete={handleTKRConfigurationComplete}
          />
        ) : (
          <Card className="p-6">
            <p className="text-gray-400">Only tournament creators and administrators can access configuration</p>
          </Card>
        );
      
      default:
        return null;
    }
  };

  // Regular tournament content rendering
  const renderRegularContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <TournamentDetails
            tournament={tournament}
            canManage={canManageTournament}
            onUpdate={handleTournamentUpdate}
          />
        );

      case 'teams':
        return (
          <Card className="p-6">
            <TeamList 
              tournamentId={id} 
              tournament={tournament} 
            />
          </Card>
        );
      
      case 'bracket':
        return tournament.status === 'PENDING' ? (
          <Card className="p-6 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400">
              Tournament bracket will be available once the tournament begins
            </p>
            {canManageTournament && tournament.current_teams >= 4 && (
              <Button
                variant="primary"
                onClick={handleStartTournament}
                className="mt-4"
              >
                Start Tournament
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-12">
            <WinnersBracket
              matches={winnerMatches || []}
              canManage={canManageTournament && tournament.status === 'ONGOING'}
              onMatchUpdate={(match) => setSelectedMatch(match)}
              totalTeams={tournament.current_teams}
            />
            
            {tournament.format === 'DOUBLE_ELIMINATION' && (
              <LosersBracket
                matches={loserMatches}
                canManage={canManageTournament && tournament.status === 'ONGOING'}
                onMatchUpdate={(match) => setSelectedMatch(match)}
                totalTeams={tournament.current_teams}
              />
            )}
          </div>
        );
      
      case 'leaderboard':
        return tournament.status === 'PENDING' ? (
          <Card className="p-6 text-center">
            <Table className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400">
              Leaderboard will be available once the tournament begins
            </p>
          </Card>
        ) : (
          <Leaderboard
            matches={[...winnerMatches, ...loserMatches]}
          />
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2979FF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 border-red-500/20">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/tournaments')}
            className="mt-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Button>
        </Card>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <p>Tournament not found</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/tournaments')}
            className="mt-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <PageBackground>
      <div className="max-w-[2400px] mx-auto px-4 py-8">
        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: '', type: 'info' })}
          />
        )}

        {/* TKR Setup Modal */}
        <TKRSetupModal 
          isOpen={showSetupModal}
          onClose={() => setShowSetupModal(false)}
          onSetup={() => {
            setShowSetupModal(false);
            setActiveTab('tkr-config');
          }}
        />

        {/* Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/tournaments')}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Button>
        </div>

        {/* Tournament Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {tournament.name}
                {isTKR && <span className="text-blue-400 text-2xl ml-2">(TKR)</span>}
              </h1>
              <p className="text-gray-400">Hosted by {tournament.creator_username}</p>
              {isTKR && !tkrConfigExists && canManageTournament && (
                <p className="text-yellow-400 text-sm mt-1 flex items-center">
                  <Settings className="h-4 w-4 mr-1" />
                  Configuration required
                </p>
              )}
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusStyles[tournament.status]}`}>
              {tournament.status.charAt(0) + tournament.status.slice(1).toLowerCase()}
            </span>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 flex items-center space-x-4">
              <Calendar className="h-6 w-6 text-[#2979FF]" />
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="font-medium">{new Date(tournament.start_date).toLocaleDateString()}</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center space-x-4">
              <Clock className="h-6 w-6 text-[#2979FF]" />
              <div>
                <p className="text-sm text-gray-400">Time</p>
                <p className="font-medium">{tournament.start_time}</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center space-x-4">
              <Users className="h-6 w-6 text-[#2979FF]" />
              <div>
                <p className="text-sm text-gray-400">Team Size</p>
                <p className="font-medium">{tournament.team_size} Players</p>
              </div>
            </Card>
            <Card className="p-4 flex items-center space-x-4">
              <Trophy className="h-6 w-6 text-[#2979FF]" />
              <div>
                <p className="text-sm text-gray-400">Format</p>
                <p className="font-medium">
                  {isTKR ? 'TKR' : tournament.format.replace('_', ' ')}
                </p>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          {canManageTournament && !isTKR && (
            <div className="flex justify-end space-x-4 mt-6">
              {tournament.status === 'PENDING' && tournament.current_teams >= 4 && (
                <Button variant="primary" onClick={handleStartTournament}>
                  Start Tournament
                </Button>
              )}
              {tournament.status === 'ONGOING' && (
                <Button 
                  variant="secondary"
                  onClick={handleResetTournament}
                >
                  Reset Tournament
                </Button>
              )}
            </div>
          )}

          {/* TKR Action Buttons */}
          {canManageTournament && isTKR && (
            <div className="flex justify-end space-x-4 mt-6">
              {tournament.status === 'PENDING' && (
                <>
                  {tkrConfigExists ? (
                    <Button variant="primary" onClick={handleStartTournament}>
                      Start TKR Tournament
                    </Button>
                  ) : (
                    <Button 
                      variant="primary" 
                      onClick={() => setActiveTab('tkr-config')}
                      className="flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Tournament
                    </Button>
                  )}
                </>
              )}
              {tournament.status === 'ONGOING' && (
                <Button 
                  variant="secondary"
                  onClick={handleResetTournament}
                >
                  Reset Tournament
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-800 mb-6 overflow-x-auto">
          <div className="flex space-x-4 min-w-fit pb-2">
            <TabButton 
              active={activeTab === 'details'} 
              onClick={() => setActiveTab('details')}
            >
              <div className="flex items-center whitespace-nowrap">
                <Edit2 className="h-4 w-4 mr-2" />
                Details
              </div>
            </TabButton>

            {isTKR ? (
              // TKR-specific tabs
              <>
                <TabButton 
                  active={activeTab === 'leaderboard'} 
                  onClick={() => setActiveTab('leaderboard')}
                >
                  <div className="flex items-center whitespace-nowrap">
                    <Trophy className="h-4 w-4 mr-2" />
                    Live Leaderboard
                  </div>
                </TabButton>
                <TabButton 
                  active={activeTab === 'teams'} 
                  onClick={() => setActiveTab('teams')}
                >
                  <div className="flex items-center whitespace-nowrap">
                    <Users className="h-4 w-4 mr-2" />
                    Register ({tkrDetails?.total_registrations || 0})
                  </div>
                </TabButton>
                
                {/* Submit Scores Tab - Only show if user can submit scores */}
                {canSubmitScores && (
                  <TabButton 
                    active={activeTab === 'submit-scores'} 
                    onClick={() => setActiveTab('submit-scores')}
                  >
                    <div className="flex items-center whitespace-nowrap">
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Scores
                    </div>
                  </TabButton>
                )}
                
                {canManageTournament && (
                  <>
                    <TabButton 
                      active={activeTab === 'host-dashboard'} 
                      onClick={() => setActiveTab('host-dashboard')}
                      disabled={!tkrConfigExists}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        <Table className="h-4 w-4 mr-2" />
                        Host Dashboard
                        {!tkrConfigExists && <AlertCircle className="h-3 w-3 ml-1" />}
                      </div>
                    </TabButton>
                    <TabButton 
                      active={activeTab === 'tkr-config'} 
                      onClick={() => setActiveTab('tkr-config')}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        <Settings className="h-4 w-4 mr-2" />
                        Configuration
                        {tkrConfigExists && <CheckCircle className="h-3 w-3 ml-1 text-green-400" />}
                        {!tkrConfigExists && <AlertCircle className="h-3 w-3 ml-1 text-yellow-400" />}
                      </div>
                    </TabButton>
                  </>
                )}
              </>
            ) : (
              // Regular tournament tabs
              <>
                <TabButton 
                  active={activeTab === 'bracket'} 
                  onClick={() => setActiveTab('bracket')}
                >
                  <div className="flex items-center whitespace-nowrap">
                    <Trophy className="h-4 w-4 mr-2" />
                    Bracket
                  </div>
                </TabButton>
                <TabButton 
                  active={activeTab === 'teams'} 
                  onClick={() => setActiveTab('teams')}
                >
                  <div className="flex items-center whitespace-nowrap">
                    <Users className="h-4 w-4 mr-2" />
                    Teams ({tournament.current_teams}/{tournament.max_teams})
                  </div>
                </TabButton>
                <TabButton 
                  active={activeTab === 'leaderboard'} 
                  onClick={() => setActiveTab('leaderboard')}
                >
                  <div className="flex items-center whitespace-nowrap">
                    <Table className="h-4 w-4 mr-2" />
                    Leaderboard
                  </div>
                </TabButton>
              </>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {isTKR ? renderTKRContent() : renderRegularContent()}
        </div>

        {/* Match Update Modal for regular tournaments */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <MatchUpdateModal
              match={selectedMatch}
              onClose={() => setSelectedMatch(null)}
              onUpdate={async (matchData) => {
                // Handle match updates here
                setSelectedMatch(null);
              }}
            />
          </div>
        )}

        {/* Victory Modal */}
        {showVictoryModal && (
          <VictoryModal
            winner={victoryTeam}
            onClose={() => setShowVictoryModal(false)}
          />
        )}
      </div>
    </PageBackground>
  );
};

export default TournamentDetail;