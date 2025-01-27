// LosersMatchCard.jsx
import React from 'react';

const LosersMatchCard = ({ match, onMatchClick }) => {
  
    const getTeamStyle = (teamId) => {
      const styles = ['p-1 text-sm rounded flex justify-between items-center'];
      styles.push(teamId ? 'bg-gray-700' : 'bg-gray-700/50');
      
      if (match.winner_id === teamId) {
        styles.push('font-bold border-l-2 border-red-500');
      } else if (teamId && match.winner_id && match.winner_id !== teamId) {
        styles.push('line-through text-gray-500');
      }
      
      return styles.join(' ');
    };
  
    const getTeamDisplay = (position) => {
        // Get the correct team based on position
        const team = position === 1 ? match.team1 : match.team2;
        const teamId = position === 1 ? match.team1_id : match.team2_id;
        
        // If we have a team ID and team data, display it
        if (teamId && team) {
            return (
                <span className="flex items-center gap-2">
                    <span className="text-xs bg-gray-600 px-1 rounded">
                        {team.seed}
                    </span>
                    <span>{team.name}</span>
                </span>
            );
        }
    
        // Use the predetermined progression data from database
        const fromWinners = position === 1 ? match.team1_from_winners : match.team2_from_winners;
        const winnersRound = position === 1 ? match.team1_winners_round : match.team2_winners_round;
        const winnersMatch = position === 1 ? match.team1_winners_match_number : match.team2_winners_match_number;
    
        if (fromWinners) {
            return (
                <span className="text-blue-500 text-sm">
                    Loser of Winners Round {winnersRound} Match {winnersMatch}
                </span>
            );
        } else {
            return (
                <span className="text-red-500 text-sm">
                    Winner of Losers Round {winnersRound} Match {winnersMatch}
                </span>
            );
        }
    };
  
    return (
      <div className="bg-gray-800 rounded p-1 w-72 cursor-pointer hover:bg-gray-700 transition-all duration-200">
        <div onClick={() => onMatchClick(match)}>
          <div className="text-sm text-gray-400 px-2 py-0.25">
            Losers Match {match.match_number}
          </div>
          
          <div className={getTeamStyle(match.team1_id)}>
            {getTeamDisplay(1)}
          </div>
          
          <div className={getTeamStyle(match.team2_id)}>
            {getTeamDisplay(2)}
          </div>
        </div>
      </div>
    );
  };

export default LosersMatchCard;