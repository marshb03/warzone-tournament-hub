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
  Edit2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tournamentService } from '../services/tournament';
import { matchService } from '../services/match';
import api from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import TeamList from '../components/tournament/TeamList';
import WinnersBracket from '../components/tournament/WinnersBracket';
import LosersBracket from '../components/tournament/LosersBracket';
import MatchUpdateModal from '../components/tournament/MatchUpdateModal';
import Leaderboard from '../components/tournament/Leaderboard';
import TournamentDetails from '../components/tournament/TournamentDetails';

const statusStyles = {
  PENDING: 'bg-yellow-500/20 text-yellow-500',
  ONGOING: 'bg-green-500/20 text-green-500',
  COMPLETED: 'bg-blue-500/20 text-blue-500',
  CANCELLED: 'bg-red-500/20 text-red-500'
};

const TabButton = ({ active, onClick, children }) => (
  <button
    className={`px-4 py-2 font-medium rounded-lg transition-colors ${
      active 
        ? 'bg-[#2979FF] text-white' 
        : 'text-gray-400 hover:bg-gray-800'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Tournament and match states
  const [tournament, setTournament] = useState(null);
  const [winnerMatches, setWinnerMatches] = useState([]);
  const [loserMatches, setLoserMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bracket');
  // const [updatingMatch, setUpdatingMatch] = useState(false);

  useEffect(() => {
    const fetchTournamentData = async () => {
        try {
            setLoading(true);
            setError(null);
    
            // Fetch tournament details
            const tournamentData = await tournamentService.getTournamentById(id);
            setTournament(tournamentData);
    
            if (tournamentData.status !== 'PENDING') {
                // Get all matches
                const matchesData = await tournamentService.getTournamentMatches(id);
                
                // Set winners bracket and finals matches
                setWinnerMatches([
                    ...(matchesData.winners_bracket || []),
                    ...(matchesData.finals || [])
                ]);
                
                // Set losers bracket matches if double elimination
                if (tournamentData.format === 'DOUBLE_ELIMINATION') {
                    console.log('Loading losers bracket data:', matchesData.losers_bracket); // Debug log
                    setLoserMatches(matchesData.losers_bracket || []);
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
  }, [id]);

  const canManageTournament = user && (
    user.role === 'SUPER_ADMIN' || 
    (user.role === 'HOST' && tournament?.creator_id === user.id)
  );

  const handleStartTournament = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Start the tournament
      await api.post(`/api/v1/tournaments/${id}/start`);
      
      // Small delay to ensure backend has processed everything
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch all updated data
      const [updatedTournament, matchesData] = await Promise.all([
        tournamentService.getTournamentById(id),
        tournamentService.getTournamentMatches(id)
      ]);
      
      // Update all states at once
      setTournament(updatedTournament);
      if (updatedTournament.format === 'DOUBLE_ELIMINATION') {
        setWinnerMatches([
          ...(matchesData.winners_bracket || []),
          ...(matchesData.finals || [])
        ]);
        setLoserMatches(matchesData.losers_bracket || []);
      } else {
        setWinnerMatches(matchesData.winners_bracket || []);
      }
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
      
      // Refresh tournament data
      const updatedTournament = await tournamentService.getTournamentById(id);
      setTournament(updatedTournament);
      
      // Clear matches
      setWinnerMatches([]);
      setLoserMatches([]);
    } catch (error) {
      console.error('Failed to reset tournament:', error);
      setError('Failed to reset tournament. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMatchUpdateModal = (match) => {
    setSelectedMatch(match);
    return (
      <MatchUpdateModal
        match={match}
        onClose={() => setSelectedMatch(null)}
        onUpdate={handleMatchUpdate}
      />
    );
  };

  const handleTournamentUpdate = async (updatedData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update tournament via service
      await tournamentService.updateTournament(id, updatedData);
      
      // Fetch updated tournament data
      const updatedTournament = await tournamentService.getTournamentById(id);
      setTournament(updatedTournament);
  
      // Show success message or handle UI updates
    } catch (error) {
      console.error('Failed to update tournament:', error);
      setError('Failed to update tournament. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchUpdate = async (matchData) => {
    try {
        setError(null);
        console.log('Match data received:', matchData);

        // Check if this match exists in winners bracket
        const isWinnersMatch = winnerMatches.some(m => m.id === matchData.match_id);
        // Check if this is a championship match (round >= 98)
        const isChampionshipMatch = winnerMatches.some(m => m.id === matchData.match_id && m.round >= 98);
        // If not in winners bracket, must be losers match
        const isLosersMatch = loserMatches.some(m => m.id === matchData.match_id);

        if (isChampionshipMatch) {
            console.log('Detected as championship match');
            await matchService.updateChampionshipMatch(matchData.match_id, {
                winner_id: matchData.winner_id
            });
        } else if (isWinnersMatch) {
            console.log('Detected as winners match');
            await matchService.updateWinnersMatch(matchData.match_id, {
                winner_id: matchData.winner_id
            });
        } else if (isLosersMatch) {
            console.log('Detected as losers match');
            await matchService.updateLosersMatch(matchData.match_id, {
                winner_id: matchData.winner_id
            });
        } else {
            throw new Error('Unable to determine match type');
        }

        // Refresh tournament data
        const matchesData = await tournamentService.getTournamentMatches(id);
        
        // Update state with new data
        setWinnerMatches([
            ...(matchesData.winners_bracket || []),
            ...(matchesData.finals || [])
        ]);
        if (tournament.format === 'DOUBLE_ELIMINATION') {
            setLoserMatches(matchesData.losers_bracket || []);
        }

    } catch (error) {
        console.error('Failed to update match:', error);
        console.error('Error details:', error.response || error);
        setError('Failed to update match. Please try again.');
    }
  };
  
  const renderTabContent = () => {
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
            onMatchUpdate={renderMatchUpdateModal}
            totalTeams={tournament.current_teams}
          />
            
            {tournament.format === 'DOUBLE_ELIMINATION' && (
              <>
                <LosersBracket
                  matches={loserMatches}
                  canManage={canManageTournament && tournament.status === 'ONGOING'}
                  onMatchUpdate={renderMatchUpdateModal}
                  totalTeams={tournament.current_teams}
                />
              </>
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
    <div className="max-w-[2400px] mx-auto px-4 py-8">
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
            <h1 className="text-4xl font-bold mb-2">{tournament.name}</h1>
            <p className="text-gray-400">Hosted by {tournament.creator_username}</p>
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
              <p className="font-medium">{tournament.format.replace('_', ' ')}</p>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        {canManageTournament && (
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
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-800 mb-6">
        <div className="flex space-x-4">
          <TabButton 
            active={activeTab === 'details'} 
            onClick={() => setActiveTab('details')}
          >
            <div className="flex items-center">
              <Edit2 className="h-4 w-4 mr-2" />
              Details
            </div>
          </TabButton>
          <TabButton 
            active={activeTab === 'bracket'} 
            onClick={() => setActiveTab('bracket')}
          >
            <div className="flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Bracket
            </div>
          </TabButton>
          <TabButton 
            active={activeTab === 'teams'} 
            onClick={() => setActiveTab('teams')}
          >
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Teams ({tournament.current_teams}/{tournament.max_teams})
            </div>
          </TabButton>
          <TabButton 
            active={activeTab === 'leaderboard'} 
            onClick={() => setActiveTab('leaderboard')}
          >
            <div className="flex items-center">
              <Table className="h-4 w-4 mr-2" />
              Leaderboard
            </div>
          </TabButton>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>

      {/* Add the Modal here, right before the closing div */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <MatchUpdateModal
            match={selectedMatch}
            onClose={() => setSelectedMatch(null)}
            onUpdate={handleMatchUpdate}
          />
        </div>
      )}
    </div>  // Final closing div
  );
};

export default TournamentDetail;