import React from 'react';
import { Trophy } from 'lucide-react';

const MatchCard = ({ match, onMatchClick, isResetMatch }) => {
  const getTeamStyle = (teamId) => {
    const styles = ['p-2 text-sm rounded flex justify-between items-center'];
    styles.push(teamId ? 'bg-gray-700' : 'bg-gray-700/50');
    
    if (match.winner_id === teamId) {
      styles.push('font-bold border-l-2 border-yellow-500');
    } else if (teamId && match.winner_id && match.winner_id !== teamId) {
      styles.push('line-through text-gray-500');
    }
    
    return styles.join(' ');
  };

  const getTeamDisplay = (team, position) => {
    if (team) {
      return (
        <span className="flex items-center gap-2">
          <span className="text-xs bg-gray-600 px-1 rounded">
            {team.seed || '-'}
          </span>
          <span>{team.name}</span>
        </span>
      );
    }

    if (position === 1) {
      return (
        <span className="text-blue-500 text-sm">
          Winners Bracket Champion
        </span>
      );
    }

    return (
        <span className="text-red-500 text-sm">
          Losers Bracket Champion
        </span>
    );
  };

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden w-64 ${isResetMatch ? 'border border-yellow-500/50' : ''}`}>
      {/* Match Header */}
      <div className="bg-yellow-500/10 px-3 py-1">
        <div className="flex items-center justify-between">
          <span className="text-yellow-500 text-xs font-medium">
            {isResetMatch ? 'Championship Reset' : 'Championship'}
          </span>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </div>
      </div>

      {/* Match Content */}
      <div 
        className="p-2 cursor-pointer hover:bg-gray-700/50 transition-all duration-200"
        onClick={() => onMatchClick(match)}
      >
        <div className={getTeamStyle(match.team1_id)}>
          {getTeamDisplay(match.team1, 1)}
        </div>
        <div className={getTeamStyle(match.team2_id)}>
          {getTeamDisplay(match.team2, 2)}
        </div>
      </div>
    </div>
  );
};

const ChampionshipMatches = ({ matches = [], canManage = false, onMatchUpdate }) => {
  if (!matches?.length) {
    return null;
  }

  const initialMatch = matches.find(m => m.round === 98);
  const resetMatch = matches.find(m => m.round === 99);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Championship Title */}
      <div className="flex items-center gap-3">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-medium text-yellow-500">Championship Finals</h3>
      </div>

      {/* Championship Matches */}
      <div className="flex items-center gap-8 justify-center">
        {initialMatch && (
          <MatchCard
            match={initialMatch}
            onMatchClick={canManage ? onMatchUpdate : undefined}
            isResetMatch={false}
          />
        )}

        {resetMatch && (
          <MatchCard
            match={resetMatch}
            onMatchClick={canManage ? onMatchUpdate : undefined}
            isResetMatch={true}
          />
        )}
      </div>

      {/* Explanation Text */}
      <p className="text-sm text-gray-400 text-center">
        A reset match will be played if the Losers Bracket Champion wins the first Championship match
      </p>
    </div>
  );
};

export default ChampionshipMatches;