// src/pages/Results.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import { tournamentService } from '../services/tournament';

const Results = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await tournamentService.getAllTournaments();
        // Filter to only show completed tournaments
        const completedTournaments = response.filter(
          tournament => tournament.status === 'COMPLETED'
        );
        setTournaments(completedTournaments);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2979FF]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tournament Results</h1>
      {tournaments.length === 0 ? (
        <Card className="p-6 text-center text-gray-400">
          No completed tournaments available
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(tournament => (
            <Card 
              key={tournament.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => navigate(`/tournaments/${tournament.id}`)}
            >
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{tournament.name}</h2>
                <div className="text-gray-400 text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[#2979FF]" />
                    <span>Winner: {tournament.winner?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#2979FF]" />
                    <span>Completed: {new Date(tournament.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#2979FF]" />
                    <span>Teams: {tournament.current_teams}/{tournament.max_teams}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;