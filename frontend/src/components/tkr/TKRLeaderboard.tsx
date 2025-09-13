// src/components/tkr/TKRLeaderboard.tsx
import React, { useState, useEffect } from 'react';
import { Trophy, Users, Target, Clock, RefreshCw, DollarSign } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { tkrService } from '../../services/tkr';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';
import {
  TKRLeaderboardEntry,
  TKRPrizePool,
  TKRTournamentConfig
} from '../../types/tkr';

interface TKRLeaderboardProps {
  tournamentId: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

const TKRLeaderboard: React.FC<TKRLeaderboardProps> = ({
  tournamentId,
  autoRefresh = true,
  refreshInterval = 30
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [leaderboard, setLeaderboard] = useState<TKRLeaderboardEntry[]>([]);
  const [prizePool, setPrizePool] = useState<TKRPrizePool | null>(null);
  const [config, setConfig] = useState<TKRTournamentConfig | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const canManage = user && (
    user.role === UserRole.SUPER_ADMIN || 
    user.role === UserRole.HOST
  );

  useEffect(() => {
    loadData();
  }, [tournamentId]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshData();
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, tournamentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [leaderboardData, configData] = await Promise.all([
        tkrService.getLeaderboard(tournamentId),
        tkrService.getTournamentConfig(tournamentId)
      ]);
      
      setLeaderboard(leaderboardData);
      setConfig(configData);
      setLastUpdated(new Date());

      // Try to load prize pool if visible
      if (configData.show_prize_pool) {
        try {
          const prizePoolData = await tkrService.getPrizePool(tournamentId);
          setPrizePool(prizePoolData);
        } catch (prizeError) {
          console.log('Prize pool not visible or error loading');
        }
      }
    } catch (error) {
      console.error('Failed to load leaderboard data:', error);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      const leaderboardData = await tkrService.getLeaderboard(tournamentId);
      setLeaderboard(leaderboardData);
      setLastUpdated(new Date());

      // Refresh prize pool if visible
      if (config?.show_prize_pool && prizePool) {
        try {
          const prizePoolData = await tkrService.getPrizePool(tournamentId);
          setPrizePool(prizePoolData);
        } catch (prizeError) {
          console.log('Error refreshing prize pool');
        }
      }
    } catch (error) {
      console.error('Failed to refresh leaderboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const manualRefresh = async () => {
    if (canManage) {
      try {
        setRefreshing(true);
        await tkrService.refreshLeaderboard(tournamentId);
        await loadData();
      } catch (error) {
        console.error('Failed to refresh leaderboard:', error);
        setError('Failed to refresh leaderboard');
      } finally {
        setRefreshing(false);
      }
    } else {
      await refreshData();
    }
  };

  const getRankDisplay = (rank?: number) => {
    if (!rank) return '-';
    
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankClass = (rank?: number) => {
    if (!rank) return '';
    
    if (rank === 1) return 'text-yellow-400 font-bold';
    if (rank === 2) return 'text-gray-300 font-bold';
    if (rank === 3) return 'text-orange-400 font-bold';
    return '';
  };

  const getTeamStatusColor = (entry: TKRLeaderboardEntry) => {
    if (!entry.team_registration) return 'text-gray-400';
    
    const now = new Date();
    const startTime = new Date(entry.team_registration.start_time);
    const endTime = entry.team_registration.end_time ? new Date(entry.team_registration.end_time) : null;
    
    if (endTime && now > endTime) {
      return 'text-green-400'; // Completed
    } else if (now >= startTime && (!endTime || now <= endTime)) {
      return 'text-blue-400'; // Currently active
    } else {
      return 'text-gray-400'; // Not started yet
    }
  };

  const getTeamStatus = (entry: TKRLeaderboardEntry) => {
    if (!entry.team_registration) return 'Unknown';
    
    const now = new Date();
    const startTime = new Date(entry.team_registration.start_time);
    const endTime = entry.team_registration.end_time ? new Date(entry.team_registration.end_time) : null;
    
    if (endTime && now > endTime) {
      return 'Completed';
    } else if (now >= startTime && (!endTime || now <= endTime)) {
      return 'Playing Now';
    } else {
      return 'Scheduled';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2979FF]" />
          <span className="ml-2">Loading leaderboard...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-500/20">
        <div className="flex items-center space-x-2 text-red-500 mb-4">
          <Target className="h-5 w-5" />
          <p>{error}</p>
        </div>
        <Button variant="secondary" onClick={loadData}>
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Prize Pool and Refresh */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-[#2979FF]" />
            Live Leaderboard
          </h2>
          {prizePool && (
            <div className="flex items-center space-x-2 text-green-400">
              <DollarSign className="h-5 w-5" />
              <span className="font-semibold">
                ${prizePool.final_prize_pool.toLocaleString()} Prize Pool
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <div className="text-sm text-gray-400 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <Button
            variant="secondary"
            onClick={manualRefresh}
            disabled={refreshing}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Tournament Stats */}
      {config && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-[#2979FF]" />
              <div>
                <p className="text-sm text-gray-400">Teams Registered</p>
                <p className="text-2xl font-bold">{leaderboard.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-[#2979FF]" />
              <div>
                <p className="text-sm text-gray-400">Best Games Count</p>
                <p className="text-2xl font-bold">{config.best_games_count}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-[#2979FF]" />
              <div>
                <p className="text-sm text-gray-400">Time Window</p>
                <p className="text-2xl font-bold">{config.consecutive_hours}h</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-[#2979FF]" />
              <div>
                <p className="text-sm text-gray-400">Map</p>
                <p className="text-lg font-bold">{config.map_name}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Leaderboard Table */}
      <Card className="overflow-hidden">
        {leaderboard.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No teams have registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Team</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Games</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Total Kills</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Total Score</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Avg Kills</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-300">Avg Place</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {leaderboard.map((entry, index) => (
                  <tr 
                    key={entry.id}
                    className={`hover:bg-gray-800/50 ${
                      entry.current_rank && entry.current_rank <= 3 ? 'bg-gray-800/30' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className={`text-2xl ${getRankClass(entry.current_rank)}`}>
                        {getRankDisplay(entry.current_rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-semibold text-white">{entry.team_name}</p>
                          {entry.team_registration && (
                            <p className="text-sm text-gray-400">
                              Team Rank: {entry.team_registration.team_rank}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-medium ${getTeamStatusColor(entry)}`}>
                        {getTeamStatus(entry)}
                      </span>
                      {entry.team_registration && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(entry.team_registration.start_time).toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-white">
                        {entry.games_submitted}
                      </span>
                      {config && (
                        <span className="text-sm text-gray-400">
                          /{config.best_games_count}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-red-400">
                        {entry.total_kills}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xl font-bold text-[#2979FF]">
                        {entry.total_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-300">
                        {entry.average_kills ? entry.average_kills.toFixed(1) : '0.0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-300">
                        {entry.average_placement ? entry.average_placement.toFixed(1) : '0.0'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className="text-center text-xs text-gray-500">
          <Clock className="h-3 w-3 inline mr-1" />
          Auto-refreshing every {refreshInterval} seconds
        </div>
      )}
    </div>
  );
};

export default TKRLeaderboard;