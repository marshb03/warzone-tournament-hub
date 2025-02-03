// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Trophy, Activity, Shield,
  BarChart2,  UserPlus
} from 'lucide-react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services';
import PageBackground from '../../components/backgrounds/PageBackground';

const SmallStatCard = ({ title, value, icon: Icon, subText }) => (
  <Card className="p-4 hover:bg-gray-800/50 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-xl font-bold mt-1">{value}</p>
        {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
      </div>
      <div className="bg-[#2979FF]/10 p-2 rounded-lg">
        <Icon className="h-5 w-5 text-[#2979FF]" />
      </div>
    </div>
  </Card>
);

const LargeCard = ({ title, children }) => (
  <Card className="p-6">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    {children}
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
    <PageBackground>
    <div className="max-w-[2400px] mx-auto px-4 py-8 space-y-6">
      {/* Welcome Section with Quick Actions */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Welcome back, {user?.username}
            </p>
          </div>
          <div className="flex gap-4">
            <Link 
              to="/admin/users"
              className="flex items-center px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Users className="h-5 w-5 text-[#2979FF] mr-2" />
              <span>Manage Users</span>
            </Link>
            <Link 
              to="/admin/tournaments"
              className="flex items-center px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Trophy className="h-5 w-5 text-[#2979FF] mr-2" />
              <span>Manage Tournaments</span>
            </Link>
            <Link 
              to="/admin/host-applications"
              className="flex items-center px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <UserPlus className="h-5 w-5 text-[#2979FF] mr-2" />
              <span>Host Applications</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Small Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <SmallStatCard 
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          subText={`${stats.activeUsers} active`}
        />
        <SmallStatCard
          title="Tournament Hosts"
          value={stats.totalHosts}
          icon={Shield}
        />
        <SmallStatCard
          title="Active Tournaments"
          value={stats.activeTournaments}
          icon={Trophy}
        />
        <SmallStatCard
          title="System Status"
          value="Operational"
          icon={Activity}
          subText="All systems normal"
        />
        <SmallStatCard 
          title="Total Page Views"
          value={stats.pageViews?.toLocaleString() || '0'}
          icon={BarChart2}
          subText="Since launch"
        />
      </div>

      {/* Large Cards Grid - Four Equal Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* System Health */}
        <LargeCard title="System Health">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">CPU Usage</span>
              <div className="flex items-center">
                <div className="w-32 h-2 bg-gray-700 rounded-full mr-2">
                  <div 
                    className="h-2 rounded-full bg-[#2979FF]" 
                    style={{ width: `${stats.systemHealth.cpuUsage}%` }}
                  />
                </div>
                <span>{stats.systemHealth.cpuUsage}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Memory Usage</span>
              <div className="flex items-center">
                <div className="w-32 h-2 bg-gray-700 rounded-full mr-2">
                  <div 
                    className="h-2 rounded-full bg-[#2979FF]" 
                    style={{ width: `${stats.systemHealth.memoryUsage}%` }}
                  />
                </div>
                <span>{stats.systemHealth.memoryUsage}%</span>
              </div>
            </div>
          </div>
        </LargeCard>

        {/* Tournament Status */}
        <LargeCard title="Tournament Status">
          <div className="space-y-3">
            {Object.entries(stats.tournamentsByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-gray-400">{status.replace('_', ' ')}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </LargeCard>

        {/* Recent Users */}
        <LargeCard title="Recent Users">
          <div className="space-y-3">
            {(stats.recentUsers || []).slice(0, 5).map((user, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-4 w-4 text-[#2979FF]" />
                  <div>
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </LargeCard>

        {/* Most Popular Format */}
        <LargeCard title="Most Popular Format">
          <div className="space-y-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-medium text-[#2979FF]">
                  {stats.popularFormat || 'Single Elimination'}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Tournament Usage</span>
                  <span className="text-gray-300">{stats.popularFormatPercentage || 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full mt-2">
                  <div 
                    className="h-2 rounded-full bg-[#2979FF]" 
                    style={{ width: `${stats.popularFormatPercentage || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </LargeCard>
      </div>
    </div>
    </PageBackground>
  );
};

export default AdminDashboard;