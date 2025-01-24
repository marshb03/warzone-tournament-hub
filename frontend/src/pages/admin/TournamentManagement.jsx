// src/pages/admin/TournamentManagement.jsx
import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MoreVertical,
  Play,
  CheckCircle,
  RefreshCcw,
  Loader2,
  Trash2
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { adminService } from '../../services';

const TournamentRow = ({ tournament, onAction }) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusStyle = (status) => {
    const styles = {
      PENDING: 'bg-yellow-500/20 text-yellow-500',
      ONGOING: 'bg-green-500/20 text-green-500',
      COMPLETED: 'bg-blue-500/20 text-blue-500',
      CANCELLED: 'bg-red-500/20 text-red-500'
    };
    return styles[status] || 'bg-gray-500/20 text-gray-500';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <tr className="border-b border-gray-800">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium">{tournament.name}</div>
            <div className="text-xs text-gray-400">by {tournament.creator_username}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(tournament.status)}`}>
          {tournament.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {formatDate(tournament.start_date)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-400">
          {tournament.current_teams}/{tournament.max_teams} teams
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowActions(!showActions)}
            className="p-2"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showActions && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1" role="menu">
                {tournament.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      onAction(tournament.id, 'start');
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Tournament
                  </button>
                )}

                {tournament.status === 'ONGOING' && (
                  <>
                    <button
                      onClick={() => {
                        onAction(tournament.id, 'complete');
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </button>
                    <button
                      onClick={() => {
                        onAction(tournament.id, 'reset');
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Reset Tournament
                    </button>
                  </>
                )}

                {/* Add Delete option - available for all statuses */}
                        <button
                            onClick={() => {
                            onAction(tournament.id, 'delete');
                            setShowActions(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-700"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Tournament
                        </button>
                    </div>
                </div>
                )}
        </div>
      </td>
    </tr>
  );
};

const TournamentManagement = () => {
  // const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hostFilter, setHostFilter] = useState('all');

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllTournaments();
      setTournaments(response);
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentAction = async (tournamentId, action) => {
    try {
      let response;
      switch (action) {
        case 'start':
          response = await adminService.startTournament(tournamentId);
          break;
        case 'complete':
          response = await adminService.completeTournament(tournamentId);
          break;
        case 'reset':
          if (window.confirm('Are you sure you want to reset this tournament? This will clear all matches and results.')) {
            response = await adminService.resetTournament(tournamentId);
          }
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
            response = await adminService.deleteTournament(tournamentId);
          }
          break;
        default:
          return;
      }
      
      if (response) {
        await fetchTournaments(); // Refresh the list
      }
    } catch (error) {
      console.error(`Failed to ${action} tournament:`, error);
      alert(`Failed to ${action} tournament. ${error.response?.data?.detail || ''}`);
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.creator_username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    const matchesHost = hostFilter === 'all' || tournament.creator_username === hostFilter;
    
    return matchesSearch && matchesStatus && matchesHost;
  });

  // Get unique hosts for filter
  const hosts = [...new Set(tournaments.map(t => t.creator_username))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tournament Management</h1>
        <p className="text-gray-400 mt-2">Manage and monitor all tournaments</p>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={hostFilter}
              onChange={(e) => setHostFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            >
              <option value="all">All Hosts</option>
              {hosts.map(host => (
                <option key={host} value={host}>{host}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#2979FF]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tournament
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Teams
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredTournaments.map((tournament) => (
                  <TournamentRow
                    key={tournament.id}
                    tournament={tournament}
                    onAction={handleTournamentAction}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TournamentManagement;