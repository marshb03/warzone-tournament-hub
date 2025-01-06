// src/components/tournament/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../../services/leaderboard';
import LeaderboardTable from './LeaderboardTable';

const Leaderboard = ({ matches }) => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (matches && matches.length > 0) {
      try {
        const calculatedRankings = leaderboardService.calculateRankings(matches);
        setRankings(calculatedRankings);
      } catch (err) {
        setError('Failed to calculate rankings');
        console.error('Ranking calculation error:', err);
      }
    }
    setLoading(false);
  }, [matches]);

  if (loading) {
    return <div className="text-center py-8">Loading rankings...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!rankings.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        No rankings available yet
      </div>
    );
  }

  return <LeaderboardTable rankings={rankings} />;
};

export default Leaderboard;