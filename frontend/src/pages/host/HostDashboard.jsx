// src/pages/host/HostDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trophy,
  Users,
  PlusCircle,
  Activity,
  Calendar,
  ChevronRight,
  Loader2
} from 'lucide-react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const StatCard = ({ title, value, icon: Icon, subText }) => (
  <Card className="p-6 hover:bg-gray-800/50 transition-colors">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
        {subText && <p className="text-sm text-gray-400 mt-1">{subText}</p>}
      </div>
      <div className="bg-[#2979FF]/10 p-3 rounded-lg">
        <Icon className="h-6 w-6 text-[#2979FF]" />
      </div>
    </div>
  </Card>
);

const TournamentCard = ({ tournament }) => {
  const navigate = useNavigate();
  
  const getStatusStyle = (status) => {
    const styles = {
      PENDING: 'bg-yellow-500/20 text-yellow-500',
      ONGOING: 'bg-green-500/20 text-green-500',
      COMPLETED: 'bg-blue-500/20 text-blue-500'
    };
    return styles[status] || 'bg-gray-500/20 text-gray-500';
  };

  return (
    <Card 
      className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
      onClick={() => navigate(`/tournaments/${tournament.id}`)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold">{tournament.name}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(tournament.status)}`}>
          {tournament.status}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-400">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date(tournament.start_date).toLocaleDateString()}
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <Users className="h-4 w-4 mr-2" />
          {tournament.current_teams}/{tournament.max_teams} teams
        </div>
      </div>
    </Card>
  );
};

const HostDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
      totalTournaments: 0,
      activeTournaments: 0,
      totalTeams: 0,
      pendingTournaments: 0
    });
    const [recentTournaments, setRecentTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
  
    // Memoize fetchDashboardData to prevent unnecessary recreations
    const fetchDashboardData = React.useCallback(async () => {
      try {
        setLoading(true);
        // Get host's tournaments
        const response = await api.get('/api/v1/tournaments/');
        const myTournaments = response.data.filter(t => t.creator_id === user.id);
        
        // Calculate stats
        const activeTournaments = myTournaments.filter(t => t.status === 'ONGOING');
        const pendingTournaments = myTournaments.filter(t => t.status === 'PENDING');
        const totalTeams = myTournaments.reduce((acc, t) => acc + t.current_teams, 0);
  
        setStats({
          totalTournaments: myTournaments.length,
          activeTournaments: activeTournaments.length,
          totalTeams: totalTeams,
          pendingTournaments: pendingTournaments.length
        });
  
        // Get recent tournaments
        setRecentTournaments(myTournaments.slice(0, 4));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }, [user.id]); // Add user.id as dependency
  
    useEffect(() => {
      fetchDashboardData();
    }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#2979FF]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Host Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Welcome back, {user?.username}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Tournaments"
          value={stats.totalTournaments}
          icon={Trophy}
        />
        <StatCard
          title="Active Tournaments"
          value={stats.activeTournaments}
          icon={Activity}
          subText="Currently running"
        />
        <StatCard
          title="Total Teams"
          value={stats.totalTeams}
          icon={Users}
          subText="Across all tournaments"
        />
        <StatCard
          title="Pending Tournaments"
          value={stats.pendingTournaments}
          icon={Calendar}
          subText="Not yet started"
        />
      </div>

      {/* Recent Tournaments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Tournaments</h2>
            <Link 
              to="/host/tournaments"
              className="text-[#2979FF] hover:text-[#2979FF]/80 flex items-center"
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentTournaments.length > 0 ? (
              recentTournaments.map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))
            ) : (
              <p className="text-gray-400">No tournaments created yet</p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/tournaments/new"
              className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <PlusCircle className="h-5 w-5 text-[#2979FF] mr-3" />
                  <span>Create New Tournament</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
            <Link 
              to="/host/tournaments"
              className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 text-[#2979FF] mr-3" />
                  <span>Manage Tournaments</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HostDashboard;