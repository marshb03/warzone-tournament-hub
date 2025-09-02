// src/pages/Results.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Users, Search, Filter, User, Gamepad2, DollarSign, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import { tournamentService } from '../services/tournament';
import PageBackground from '../components/backgrounds/PageBackground'

const Results = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await tournamentService.getAllTournaments();
        // Filter to only show completed tournaments
        const completedTournaments = response.filter(
          tournament => tournament.status === 'COMPLETED'
        );

        // Fetch matches for each completed tournament to get winners
        const tournamentsWithWinners = await Promise.all(
          completedTournaments.map(async (tournament) => {
            try {
              const matchesData = await tournamentService.getTournamentMatches(tournament.id);
              
              // For double elimination, check championship matches (rounds 98 and 99)
              const championshipMatches = matchesData.finals || [];
              const lastMatch = championshipMatches.length > 0 
                ? championshipMatches.reduce((latest, match) => 
                    match.round > latest.round ? match : latest
                  )
                : null;

              // If no championship matches, check the last winners bracket match
              const winnersBracketMatches = matchesData.winners_bracket || [];
              const lastWinnersMatch = winnersBracketMatches.length > 0
                ? winnersBracketMatches.reduce((latest, match) =>
                    match.round > latest.round ? match : latest
                  )
                : null;

              // Get the final winner from either championship or winners bracket
              const finalMatch = lastMatch || lastWinnersMatch;
              const winningTeam = finalMatch?.team1_id === finalMatch?.winner_id 
                ? finalMatch?.team1?.name 
                : finalMatch?.team2?.name;

              return {
                ...tournament,
                winningTeam
              };
            } catch (error) {
              console.error(`Error fetching matches for tournament ${tournament.id}:`, error);
              return {
                ...tournament,
                winningTeam: 'Unknown'
              };
            }
          })
        );

        setTournaments(tournamentsWithWinners);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  // Filter tournaments based on search
  const filteredTournaments = tournaments.filter(tournament => {
    return tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tournament.creator_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tournament.winningTeam?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tournament.game?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tournament.game_mode?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort tournaments
  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'date-asc':
        return new Date(a.end_date) - new Date(b.end_date);
      case 'date-desc':
        return new Date(b.end_date) - new Date(a.end_date);
      case 'winner-asc':
        return (a.winningTeam || '').localeCompare(b.winningTeam || '');
      case 'winner-desc':
        return (b.winningTeam || '').localeCompare(a.winningTeam || '');
      case 'game-asc':
        return (a.game || '').localeCompare(b.game || '');
      case 'game-desc':
        return (b.game || '').localeCompare(a.game || '');
      default:
        return 0;
    }
  });

  const formatTournamentFormat = (format) => {
    switch(format) {
      case 'SINGLE_ELIMINATION': return 'Single Elimination';
      case 'DOUBLE_ELIMINATION': return 'Double Elimination';
      case 'TKR': return 'TKR';
      default: return format?.replace('_', ' ') || 'Single Elimination';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2979FF]"></div>
      </div>
    );
  }

  return (
    <PageBackground>
      <div className="max-w-[2400px] mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl text-white font-bold">Tournament Results</h1>
        </div>

        {/* Search and Sort Controls */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by tournament name, winner, host, game, or mode..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 h-5 w-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              >
                <option value="date-desc">Most Recently Completed</option>
                <option value="date-asc">Oldest Completed</option>
                <option value="name-asc">Tournament Name (A-Z)</option>
                <option value="name-desc">Tournament Name (Z-A)</option>
                <option value="winner-asc">Winner Name (A-Z)</option>
                <option value="winner-desc">Winner Name (Z-A)</option>
                <option value="game-asc">Game (A-Z)</option>
                <option value="game-desc">Game (Z-A)</option>
              </select>
            </div>
          </div>
        </Card>

        {sortedTournaments.length === 0 ? (
          <Card className="p-6 text-center text-gray-400">
            {tournaments.length === 0 
              ? "No completed tournaments available"
              : "No tournaments match your search criteria"
            }
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedTournaments.map(tournament => (
              <Card 
                key={tournament.id}
                className="cursor-pointer hover:shadow-lg hover:shadow-[#2979FF]/10 transition-all duration-300 hover:scale-105"
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="mb-4">
                    <h2 className="text-xl text-white font-bold mb-2">{tournament.name}</h2>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {formatTournamentFormat(tournament.format)}
                      </span>
                      <span className={`font-medium ${tournament.entry_fee && tournament.entry_fee !== 'Free' ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                        {tournament.entry_fee || 'Free'}
                      </span>
                    </div>
                  </div>

                  {/* Game Information */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Gamepad2 className="h-4 w-4 text-[#2979FF]" />
                      <span className="text-sm">{tournament.game || 'Call of Duty: Warzone'}</span>
                    </div>
                    {tournament.game_mode && (
                      <div className="pl-6">
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                          {tournament.game_mode}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tournament Details */}
                  <div className="text-gray-300 space-y-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-[#2979FF]" />
                      <span className="text-sm font-medium text-yellow-400">
                        {tournament.winningTeam || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[#2979FF]" />
                      <span className="text-sm">Host: {tournament.creator_username}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#2979FF]" />
                      <span className="text-sm">
                        {new Date(tournament.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#2979FF]" />
                      <span className="text-sm">
                        {tournament.format === 'TKR' 
                          ? `${tournament.current_teams} teams`
                          : `${tournament.current_teams}/${tournament.max_teams} teams`
                        }
                      </span>
                    </div>

                    {/* Start Date/Time for additional context */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#2979FF]" />
                      <span className="text-sm">
                        Started: {new Date(tournament.start_date).toLocaleDateString()}
                        {tournament.start_time && ` at ${tournament.start_time}`}
                      </span>
                    </div>

                    {/* TKR End Time if available */}
                    {tournament.format === 'TKR' && tournament.end_time && (
                      <div className="text-xs text-gray-400 mt-2">
                        Duration: {tournament.start_time} - {tournament.end_time} (EST)
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageBackground>
  );
};

export default Results;