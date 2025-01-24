// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Trophy, Activity, Shield, ChevronRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
// import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services';

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

const SystemHealthCard = ({ health }) => (
  <Card className="p-6">
    <h2 className="text-xl font-bold mb-4">System Health</h2>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-400">CPU Usage</span>
        <div className="flex items-center">
          <div className="w-32 h-2 bg-gray-700 rounded-full mr-2">
            <div 
              className="h-2 rounded-full bg-[#2979FF]" 
              style={{ width: `${health.cpuUsage}%` }}
            />
          </div>
          <span>{health.cpuUsage}%</span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Memory Usage</span>
        <div className="flex items-center">
          <div className="w-32 h-2 bg-gray-700 rounded-full mr-2">
            <div 
              className="h-2 rounded-full bg-[#2979FF]" 
              style={{ width: `${health.memoryUsage}%` }}
            />
          </div>
          <span>{health.memoryUsage}%</span>
        </div>
      </div>
    </div>
  </Card>
);

const TournamentStatusCard = ({ stats }) => (
  <Card className="p-6">
    <h2 className="text-xl font-bold mb-4">Tournament Status</h2>
    <div className="space-y-3">
      {Object.entries(stats).map(([status, count]) => (
        <div key={status} className="flex justify-between items-center">
          <span className="text-gray-400">{status.replace('_', ' ')}</span>
          <span className="font-bold">{count}</span>
        </div>
      ))}
    </div>
  </Card>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2979FF]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Welcome back, {user?.username}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          subText={`${stats.activeUsers} active`}
        />
        <StatCard
          title="Tournament Hosts"
          value={stats.totalHosts}
          icon={Shield}
        />
        <StatCard
          title="Active Tournaments"
          value={stats.activeTournaments}
          icon={Trophy}
        />
        <StatCard
          title="System Status"
          value="Operational"
          icon={Activity}
          subText="All systems normal"
        />
      </div>

      {/* Detailed Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SystemHealthCard health={stats.systemHealth} />
        <TournamentStatusCard stats={stats.tournamentsByStatus} />
        
        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/admin/users"
              className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-[#2979FF] mr-3" />
                  <span>Manage Users</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
            
            <Link 
              to="/admin/tournaments"
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

export default AdminDashboard;