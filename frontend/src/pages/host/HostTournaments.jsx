// src/pages/host/HostTournaments.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, PlusCircle, Loader2 } from 'lucide-react';
import TournamentCard from '../../components/tournament/TournamentCard';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const HostTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/v1/tournaments/');
        // Filter for only this host's tournaments
        const hostTournaments = response.data.filter(t => t.creator_id === user.id);
        setTournaments(hostTournaments);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        setError('Failed to load tournaments');
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [user.id]);

  // Filter tournaments based on search term and status
  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button variant="ghost" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Tournaments</h1>
        <Button
          variant="primary"
          onClick={() => navigate('/tournaments/new')}
          className="flex items-center"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Create Tournament
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search tournaments..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            >
              <option value="all">All Status</option>
              <option value="ONGOING">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tournament List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#2979FF]" />
        </div>
      ) : filteredTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(tournament => (
            <TournamentCard 
              key={tournament.id} 
              tournament={tournament}
              isOwner={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">No tournaments found</p>
        </div>
      )}
    </div>
  );
};

export default HostTournaments;