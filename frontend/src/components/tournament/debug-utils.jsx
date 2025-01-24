// Debug utilities for LosersBracket component
export const debugLosersBracket = {
    logMatchData: (match) => {
      console.group(`Match ${match.match_number} Data:`);
      console.log('Full match object:', match);
      console.log('Team 1:', {
        id: match.team1_id,
        fromWinners: match.team1_from_winners,
        winnersRound: match.team1_winners_round,
        winnersMatchNumber: match.team1_winners_match_number
      });
      console.log('Team 2:', {
        id: match.team2_id,
        fromWinners: match.team2_from_winners,
        winnersRound: match.team2_winners_round,
        winnersMatchNumber: match.team2_winners_match_number
      });
      console.groupEnd();
    },
  
    // Add this to LosersBracket component's getTeamDisplay function
    debugTeamDisplay: (match, position) => {
      const team = position === 1 ? match.team1 : match.team2;
      const fromWinners = position === 1 ? match.team1_from_winners : match.team2_from_winners;
      const round = position === 1 ? match.team1_winners_round : match.team2_winners_round;
      const matchNumber = position === 1 ? match.team1_winners_match_number : match.team2_winners_match_number;
      
      console.group(`Team Display Debug (Position ${position}):`);
      console.log('Team:', team);
      console.log('From Winners:', fromWinners);
      console.log('Winners Round:', round);
      console.log('Winners Match Number:', matchNumber);
      console.groupEnd();
      
      return { team, fromWinners, round, matchNumber };
    },
  
    // Add this to track match updates
    logMatchUpdate: (matchData) => {
      console.group('Match Update:');
      console.log('Match ID:', matchData.match_id);
      console.log('Winner ID:', matchData.winner_id);
      console.log('Full Update Data:', matchData);
      console.groupEnd();
    }
  };
  
  // Usage example in LosersBracket.jsx:
  /*
  import { debugLosersBracket } from './debug-utils';
  
  // In the MatchCard component:
  useEffect(() => {
    debugLosersBracket.logMatchData(match);
  }, [match]);
  
  // In getTeamDisplay:
  const displayData = debugLosersBracket.debugTeamDisplay(match, position);
  
  // In handleMatchUpdate:
  debugLosersBracket.logMatchUpdate(matchData);
  */