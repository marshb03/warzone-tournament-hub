// src/pages/Results.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Users, Search, Filter, User } from 'lucide-react';
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
           tournament.winningTeam?.toLowerCase().includes(searchTerm.toLowerCase());
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
      default:
        return 0;
    }
  });

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
                placeholder="Search by tournament name, winner, or host..."
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
              </select>
            </div>
          </div>
        </Card>

        {sortedTournaments.length === 0 ? (
          <Card className="p-6 text-center text-gray-400">
            No completed tournaments available
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
            {sortedTournaments.map(tournament => (
              <Card 
                key={tournament.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
              >
                <div className="p-6">
                  <h2 className="text-2xl text-white font-bold mb-4">{tournament.name}</h2>
                  <div className="text-gray-300 space-y-3">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-[#2979FF]" />
                      <span className="text-lg">Winner: {tournament.winningTeam || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-[#2979FF]" />
                      <span className="text-lg">Host: {tournament.creator_username}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-[#2979FF]" />
                      <span className="text-lg">Completed: {new Date(tournament.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-[#2979FF]" />
                      <span className="text-lg">Teams: {tournament.current_teams}/{tournament.max_teams}</span>
                    </div>
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