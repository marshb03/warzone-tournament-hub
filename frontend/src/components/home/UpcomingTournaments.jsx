// src/components/tournament/UpcomingTournaments.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { tournamentService } from '../../services/tournament';
import HomeTournamentCard from '../tournament/HomeTournamentCard';
import cache from '../../utils/cache';

export const UpcomingTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        // Check cache first
        const cachedTournaments = cache.get('upcoming-tournaments');
        if (cachedTournaments) {
          setTournaments(cachedTournaments);
          setLoading(false);
          return;
        }
  
        // If no cache, fetch from API
        const response = await tournamentService.getAllTournaments();
        const now = new Date();
        
        const upcomingTournaments = response
          .filter(t => {
            // Filter tournaments that are:
            // 1. Still pending
            // 2. Have a start date in the future
            const tournamentDate = new Date(t.start_date);
            return t.status === 'PENDING' && tournamentDate > now;
          })
          .sort((a, b) => {
            // Sort by start date, earliest first
            return new Date(a.start_date) - new Date(b.start_date);
          })
          .slice(0, 4);  // Take only the first 4
        
        setTournaments(upcomingTournaments);
        
        // Cache the response for 4 hours
        cache.set('upcoming-tournaments', upcomingTournaments, 4);
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
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2979FF]"></div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Upcoming Tournaments</h2>
        <button
          onClick={() => navigate('/tournaments')}
          className="flex items-center text-[#2979FF] hover:text-blue-400 transition-colors"
        >
          View All
          <ChevronRight className="ml-1 h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tournaments.map(tournament => (
          <HomeTournamentCard key={tournament.id} tournament={tournament} />
        ))}
        {tournaments.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-8">
            No upcoming tournaments at the moment.
          </div>
        )}
      </div>
    </div>
  );
};