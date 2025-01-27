// MatchCard.jsx
import React from 'react';
import { Trophy } from 'lucide-react';

const MatchCard = ({ match, onMatchClick, allMatches }) => {
  // Is this a championship match?
  const isChampionship = match.round >= 98;

  const getTeamStyle = (teamId) => {
    const styles = ['p-1 text-sm rounded flex justify-between items-center'];
    styles.push(teamId ? 'bg-gray-700' : 'bg-gray-700/50');
    
    if (match.winner_id === teamId) {
      styles.push(`font-bold border-l-2 ${isChampionship ? 'border-yellow-500' : 'border-blue-500'}`);
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

    // Special display for championship matches
    if (isChampionship) {
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
    }

    // Regular match progression
    if (match.round >= 2) {
      const possibleFeederMatches = allMatches.filter(m => 
        m.next_match_id === match.id && m.round === match.round - 1
      );

      if (possibleFeederMatches.length > 0) {
        possibleFeederMatches.sort((a, b) => a.match_number - b.match_number);
        const feederMatch = position === 1 
          ? possibleFeederMatches[0] 
          : possibleFeederMatches[possibleFeederMatches.length - 1];

        if (feederMatch) {
          return (
            <span className="text-blue-500 text-sm">
              Winner of Match {feederMatch.match_number}
            </span>
          );
        }
      }
    }

    return 'TBD';
  };

  if (isChampionship) {
    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden w-64">
        <div className="bg-yellow-500/10 px-3 py-1">
          <div className="flex items-center justify-between">
            <span className="text-yellow-500 text-xs font-medium">
              {match.round === 99 ? 'Championship Reset' : 'Championship'}
            </span>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </div>
        </div>
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
  }

  return (
    <div className="bg-gray-800 rounded p-1 w-72 cursor-pointer hover:bg-gray-700 transition-all duration-200">
      <div onClick={() => onMatchClick(match)}>
        <div className="text-sm text-gray-400 px-2 py-0.25">
          Match {match.match_number}
        </div>
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

export default MatchCard;