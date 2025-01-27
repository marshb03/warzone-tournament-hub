// WinnersBracketRoundColumn.jsx
import React from 'react';
import MatchCard from './MatchCard';  // Add this import

const WinnersBracketRoundColumn = ({ round, matches, onMatchClick, allMatches, totalTeams }) => {
  const sortedMatches = React.useMemo(() => {
    return [...matches].sort((a, b) => a.match_number - b.match_number);
  }, [matches]);

  // General spacing based on round
  const getRoundSpacing = () => {
    const isPowerOfTwo = (totalTeams & (totalTeams - 1)) === 0;
    
    // Perfect bracket spacing (4, 8, 16, 32 teams)
    if (isPowerOfTwo) {
      if (totalTeams <= 4) {
        return round.round_number === 1 ? 'gap-6' : 'gap-32';
      } else if (totalTeams <= 8) {
        switch(round.round_number) {
          case 1: return 'gap-6';
          case 2: return 'gap-24';
          case 3: return 'gap-80';
          default: return 'gap-96';
        }
      } else if (totalTeams <= 16) {
        switch(round.round_number) {
          case 1: return 'gap-6';
          case 2: return 'gap-32';
          case 3: return 'gap-80';
          case 4: return 'gap-96';
          default: return 'gap-96';
        }
      } else {
        // 32 teams
        switch(round.round_number) {
          case 1: return 'gap-4';
          case 2: return 'gap-16';
          case 3: return 'gap-32';
          case 4: return 'gap-64';
          case 5: return 'gap-96';
          default: return 'gap-96';
        }
      }
    }

    // For non-power-of-2 tournament sizes
    // Round 1 spacing
    if (round.round_number === 1) {
      const matchCount = matches.length;
      switch(matchCount) {
        case 1: return 'gap-0';
        case 2: return 'gap-16';
        case 3: return 'gap-12';
        case 4: return 'gap-10';
        case 5:
        case 6: return 'gap-8';
        case 7:
        case 8: return 'gap-6';
        default: return 'gap-4';
      }
    }

    // For tournaments with 5-7 teams
    if (totalTeams <= 7) {
      switch(round.round_number) {
        case 2: return 'gap-16';
        case 3: return 'gap-48';
        default: return 'gap-64';
      }
    }

    // For tournaments with 9-13 teams
    if (totalTeams <= 13) {
      switch(round.round_number) {
        case 2: return 'gap-16';
        case 3: return 'gap-24';
        case 4: return 'gap-48';
        default: return 'gap-64';
      }
    }

    // For tournaments with 14-15 teams
    if (totalTeams <= 15) {
      switch(round.round_number) {
        case 2: return 'gap-20';
        case 3: return 'gap-24';
        case 4: return 'gap-48';
        default: return 'gap-64';
      }
    }

    // For tournaments with 17-24 teams
    if (totalTeams <= 24) {
      switch(round.round_number) {
        case 2: return 'gap-8';
        case 3: return 'gap-24';
        case 4: return 'gap-48';
        case 5: return 'gap-64';
        default: return 'gap-96';
      }
    }

    if (totalTeams < 32) {
      switch(round.round_number) {
        case 2: return 'gap-12';
        case 3: return 'gap-24';
        case 4: return 'gap-48';
        case 5: return 'gap-64';
        default: return 'gap-96';
      }
    }

    return 'gap-32'; // Default fallback
  };

  // Round 1 precise additional spacing for each tournament size
  const round1AdditionalSpacing = (matchIndex) => {
    const isPerfectBracket = totalTeams === 4 || totalTeams === 8 || 
                            totalTeams === 16 || totalTeams === 32;
    
    if (isPerfectBracket || round.round_number !== 1) return '0';

    switch(totalTeams) {
      case 5:
        switch(matchIndex) {
          case 1: return '2rem';
          default: return '0';
        }
      case 6:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          default: return '0';
        }
      case 7:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          default: return '0';
        }
      case 9:
        switch(matchIndex) {
          case 0: return '0rem';
          default: return '0';
        }
      case 10:
        switch(matchIndex) {
          case 1: return '9rem';
          default: return '0';
        }
      case 11:
        switch(matchIndex) {
          case 1: return '10rem';
          case 2: return '1rem';
          default: return '0';
        }
      case 12:
        switch(matchIndex) {
          case 1: return '1.5rem';
          case 2: return '1.5rem';
          case 3: return '1.5rem';
          case 4: return '0rem';
          default: return '0';
        }
      case 13:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '1.5rem';
          case 4: return '1.5rem';
          default: return '0';
        }
      case 14:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          case 4: return '0rem';
          case 5: return '0rem';
          default: return '0';
        }
      case 15:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          case 4: return '0rem';
          case 5: return '0rem';
          default: return '0';
        }
      case 17:
        switch(matchIndex) {
          case 1: return '0rem';
          default: return '0';
        }

      case 18:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '19.5rem';
          default: return '0';
        }

      case 19:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '20.5rem';
          case 2: return '6.5rem';
          default: return '0';
        }

      case 20:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '7rem';
          case 2: return '6.75rem';
          case 3: return '6.5rem';
          default: return '0';
        }

      case 21:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '7.25rem';
          case 2: return '0rem';
          case 3: return '0rem';
          case 4: return '7.25rem';
          default: return '0';
        }

      case 22:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '7.25rem';
          case 2: return '0rem';
          case 3: return '0rem';
          case 4: return '7.25rem';
          case 5: return '0rem';
          default: return '0';
        }

      case 23:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '7.75rem';
          case 2: return '.5rem';
          case 3: return '.5rem';
          case 4: return '.5rem';
          case 5: return '.5rem';
          case 6: return '.5rem';
          default: return '0';
        }

      case 24:
        switch(matchIndex) {
          case 1: return '0.5rem';
          case 2: return '0.5rem';
          case 3: return '0.5rem';
          case 4: return '0.5rem';
          case 5: return '0.5rem';
          case 6: return '0.5rem';
          case 7: return '0.5rem';
          default: return '0';
        }

      case 25:
        switch(matchIndex) {
          case 1: return '0.5rem';
          case 2: return '0.5rem';
          case 3: return '0.5rem';
          case 4: return '2rem';
          case 5: return '2rem';
          case 6: return '2rem';
          case 7: return '2rem';
          case 8: return '2rem';
          default: return '0';
        }

      case 26:
        switch(matchIndex) {
          case 1: return '0.5rem';
          case 2: return '0.5rem';
          case 3: return '0.5rem';
          case 4: return '2rem';
          case 5: return '2rem';
          case 6: return '2rem';
          case 7: return '0.5rem';
          case 8: return '2rem';
          case 9: return '2rem';
          default: return '0';
        }

      case 27:
        switch(matchIndex) {
          case 1: return '0.5rem';
          case 2: return '0.5rem';
          case 3: return '0.5rem';
          case 4: return '2rem';
          case 5: return '2rem';
          case 6: return '2rem';
          case 7: return '0.5rem';
          case 8: return '2rem';
          case 9: return '2rem';
          default: return '0';
        }

      case 28:
        switch(matchIndex) {
          case 1: return '0.5rem';
          case 2: return '0.5rem';
          case 3: return '0.5rem';
          case 4: return '0.5rem';
          case 5: return '0.5rem';
          case 6: return '0.5rem';
          case 7: return '0.5rem';
          case 8: return '0.5rem';
          case 9: return '0.5rem';
          case 10: return '0.5rem';
          default: return '0';
        }

      case 29:
        switch(matchIndex) {
          case 1: return '0.5rem';
          case 2: return '0.5rem';
          case 3: return '0.5rem';
          case 4: return '0.5rem';
          case 5: return '0.5rem';
          case 6: return '0.5rem';
          case 7: return '0.5rem';
          case 8: return '0.5rem';
          case 9: return '0.5rem';
          case 10: return '0.5rem';
          case 11: return '0.5rem';
          default: return '0';
        }

      case 30:
        switch(matchIndex) {
          case 1: return '0.5rem';
          case 2: return '0.5rem';
          case 3: return '0.5rem';
          case 4: return '0.5rem';
          case 5: return '0.5rem';
          case 6: return '0.5rem';
          case 7: return '0.5rem';
          case 8: return '0.5rem';
          case 9: return '0.5rem';
          case 10: return '0.5rem';
          case 11: return '0.5rem';
          case 12: return '0.5rem';
          default: return '0';
        }

      case 31:
        switch(matchIndex) {
          case 1: return '0.5rem';
          case 2: return '0.5rem';
          case 3: return '0.5rem';
          case 4: return '0.5rem';
          case 5: return '0.5rem';
          case 6: return '0.5rem';
          case 7: return '0.5rem';
          case 8: return '0.5rem';
          case 9: return '0.5rem';
          case 10: return '0.5rem';
          case 11: return '0.5rem';
          case 12: return '0.5rem';
          case 13: return '0.5rem';
          case 14: return '0.5rem';
          default: return '0';
        }
      default: return '0';
    }
  };

  const round2AdditionalSpacing = (matchIndex) => {

    switch(totalTeams) {
      case 5:
        switch(matchIndex) {
          case 1: return '0rem';
          default: return '0';
        }
      
      case 6:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          default: return '0';
        }
      
      case 7:
        switch(matchIndex) {
          case 0: return '4rem';
          case 1: return '0rem';
          default: return '0';
        }

      case 8:
        switch(matchIndex) {
          case 0: return '4rem';
          case 1: return '1rem';
          default: return '0';
        }

      case 9:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          default: return '0';
        }

      case 10:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          default: return '0';
        }

      case 11:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          default: return '0';
        }

      case 12:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          default: return '0';
        }

      case 13:
        switch(matchIndex) {
          case 1: return '1.5rem';
          case 2: return '3rem';
          case 3: return '0rem';
          default: return '0';
        }

      case 14:
        switch(matchIndex) {
          case 1: return '1rem';
          case 2: return '0rem';
          case 3: return '1rem';
          default: return '0';
        }

      case 15:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '3rem';
          case 3: return '3rem';
          default: return '0';
        }

      case 16:
        switch(matchIndex) {
          case 0: return '3.5rem';
          case 1: return '0.5rem';
          case 2: return '0.5rem';
          default: return '0';
        }

      case 17:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          case 4: return '0rem';
          default: return '0';
        }

      case 18:
      case 19:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          case 4: return '0rem';
          default: return '0';
        }

      case 20:
      case 21:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          case 4: return '0rem';
          case 5: return '0rem';
          default: return '0';
        }

      case 22:
      case 23:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          case 4: return '0rem';
          case 5: return '0rem';
          default: return '0';
        }

      case 24:
        switch(matchIndex) {
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          case 4: return '0rem';
          case 5: return '0rem';
          case 6: return '0rem';
          default: return '0';
        }

      case 25:
        switch(matchIndex) {
          case 1: return '1.5rem';
          case 2: return '2rem';
          case 3: return '0rem';
          case 4: return '0rem';
          case 5: return '0rem';
          case 6: return '0rem';
          default: return '0';
        }

      case 26:
        switch(matchIndex) {
          case 1: return '1.5rem';
          case 2: return '2rem';
          case 3: return '0rem';
          case 4: return '0rem';
          case 5: return '3rem';
          case 6: return '3.5rem';
          default: return '0';
        }
        
      case 27:
        switch(matchIndex) {
          case 1: return '1.5rem';
          case 2: return '2rem';
          case 3: return '0rem';
          case 4: return '0rem';
          case 5: return '3rem';
          case 6: return '3.5rem';
          case 7: return '3.5rem';
          default: return '0';
        }

      case 28:
        switch(matchIndex) {
          case 1: return '1.5rem';
          case 2: return '2rem';
          case 3: return '2rem';
          case 4: return '1.75rem';
          case 5: return '2rem';
          case 6: return '2rem';
          case 7: return '1.5rem';
          default: return '0';
        }

      case 29:
        switch(matchIndex) {
          case 1: return '2.5rem';
          case 2: return '5rem';
          case 3: return '5rem';
          case 4: return '2rem';
          case 5: return '2rem';
          case 6: return '1.5rem';
          case 7: return '1.5rem';
          default: return '0';
        }

      case 30:
        switch(matchIndex) {
          case 1: return '1.5rem';
          case 2: return '5.75rem';
          case 3: return '5rem';
          case 4: return '2rem';
          case 5: return '2rem';
          case 6: return '5.5rem';
          case 7: return '4.5rem';
          default: return '0';
        }

      case 31:
        switch(matchIndex) {
          case 1: return '1.5rem';
          case 2: return '5.75rem';
          case 3: return '5.25rem';
          case 4: return '5.25rem';
          case 5: return '5.25rem';
          case 6: return '5.25rem';
          case 7: return '5.25rem';
          default: return '0';
        }
      case 32:
        switch(matchIndex) {
          case 0: return '3rem';
          case 1: return '3rem';
          case 2: return '3rem';
          case 3: return '3.25rem';
          case 4: return '3.25rem';
          case 5: return '3.25rem';
          case 6: return '3.25rem';
          case 7: return '3.25rem';
          default: return '0';
        }

      default: return '0';
    }
  };

  const round3AdditionalSpacing = (matchIndex) => {

    switch(totalTeams) {
      case 5:
        return '5rem';

      case 6:
        return '5rem';
      
      case 7:
        return '8.5rem';

      case 8:
        return '7rem';

      case 9:
        switch(matchIndex) {
          case 0: return '5rem';
          case 1: return '6rem';
          default: return '0';
        }

      case 10:
        switch(matchIndex) {
          case 0: return '5rem';
          case 1: return '6rem';
          default: return '0';
        }

      case 11:
        switch(matchIndex) {
          case 0: return '5rem';
          case 1: return '6rem';
          default: return '0';
        }

      case 12:
        switch(matchIndex) {
          case 0: return '5rem';
          case 1: return '6rem';
          default: return '0';
        }

      case 13:
        switch(matchIndex) {
          case 0: return '5rem';
          case 1: return '11rem';
          default: return '0';
        }

      case 14:
        switch(matchIndex) {
          case 0: return '5.5rem';
          case 1: return '10rem';
          default: return '0';
        }

      case 15:
        switch(matchIndex) {
          case 0: return '5.5rem';
          case 1: return '13.5rem';
          default: return '0';
        }

      case 16:
        switch(matchIndex) {
          case 0: return '10.5rem';
          case 1: return '2rem';
          default: return '0';
        }

      case 17:
      case 18:
      case 19:
      case 20:
      case 21:
      case 22:
      case 23:
      case 24:
        switch(matchIndex) {
          case 0: return '4rem';
          case 1: return '3rem';
          case 2: return '3.5rem';
          case 3: return '2.5rem';
          default: return '0';
        }
      case 25:
        switch(matchIndex) {
          case 0: return '5rem';
          case 1: return '8rem';
          case 2: return '4.5rem';
          case 3: return '4.8rem';
          default: return '0';
        }

      case 26:
        switch(matchIndex) {
          case 0: return '5rem';
          case 1: return '8rem';
          case 2: return '6rem';
          case 3: return '10rem';
          default: return '0';
        }

      case 27:
        switch(matchIndex) {
          case 0: return '5rem';
          case 1: return '8rem';
          case 2: return '6rem';
          case 3: return '12rem';
          default: return '0';
        }

      case 28:
        switch(matchIndex) {
          case 0: return '5rem';
          case 1: return '8.5rem';
          case 2: return '8.5rem';
          case 3: return '8rem';
          default: return '0';
        }

      case 29:
        switch(matchIndex) {
          case 0: return '5.5rem';
          case 1: return '14rem';
          case 2: return '11rem';
          case 3: return '8rem';
          default: return '0';
        }

      case 30:
        switch(matchIndex) {
          case 0: return '5rem';
          case 1: return '14.5rem';
          case 2: return '10.5rem';
          case 3: return '14rem';
          default: return '0';
        }

      case 31:
        switch(matchIndex) {
          case 0: return '5rem';
          case 1: return '14.5rem';
          case 2: return '15.5rem';
          case 3: return '16rem';
          default: return '0';
        }

      case 32:
        switch(matchIndex) {
          case 0: return '9.5rem';
          case 1: return '11.5rem';
          case 2: return '11.5rem';
          case 3: return '11.5rem';
          default: return '0';
        }

      default: return '0';
    }
  };

  const round4AdditionalSpacing = (matchIndex) => {

    // Only tournaments with > 8 teams will have round 4
    switch(totalTeams) {
      case 9:
        return '13.5rem';
      case 10:
        return '13.5rem';
      case 11:
        return '13.5rem';

      case 12:
        return '13.5rem';

      case 13:
        return '15.5rem';

      case 14:
        return '15.5rem';

      case 15:
        return '18rem';

      case 16:
        return '24.5rem';

      // Larger tournaments
      case 17:
      case 18:
      case 19:
      case 20:
      case 21:
      case 22:
      case 23:
      case 24:
        switch(matchIndex) {
          case 0: return '11.5rem';
          case 1: return '11rem';
          default: return '0';
        }
      case 25:
        switch(matchIndex) {
          case 0: return '14.5rem';
          case 1: return '15rem';
          default: return '0';
        }

      case 26:
        switch(matchIndex) {
          case 0: return '14.5rem';
          case 1: return '19.5rem';
          default: return '0';
        }

      case 27:
        switch(matchIndex) {
          case 0: return '14.5rem';
          case 1: return '21rem';
          default: return '0';
        }

      case 28:
        switch(matchIndex) {
          case 0: return '14.5rem';
          case 1: return '21rem';
          default: return '0';
        }

      case 29:
        switch(matchIndex) {
          case 0: return '17.5rem';
          case 1: return '28rem';
          default: return '0';
        }

      case 30:
        switch(matchIndex) {
          case 0: return '17.5rem';
          case 1: return '30.5rem';
          default: return '0';
        }

      case 31:
        switch(matchIndex) {
          case 0: return '17.5rem';
          case 1: return '37rem';
          default: return '0';
        }

      case 32:
        switch(matchIndex) {
          case 0: return '22rem';
          case 1: return '28.5rem';
          default: return '0';
        }
      default: return '0';
    }
  };

  const round5AdditionalSpacing = () => {

    // Only tournaments with > 16 teams will have round 5
    switch(totalTeams) {
      case 17:
      case 18:
      case 19:
      case 20:
      case 21:
      case 22:
      case 23:
      case 24:
        return '26rem'; // Single match
      case 25:
        return '30rem';

      case 26:
        return '33.5rem';
      case 27:
        return '34rem';

      case 28:
        return '34rem';
      case 29:
        return '41rem';

      case 30:
        return '42.5rem';
      case 31:
        return '46rem';
      case 32:
        return '47.5rem';

      default: return '0';
    }
  };

  const championshipAdditionalSpacing = () => {
    // Only apply to championship rounds
    if (round.round_number < 98) return '0';

    // Handle specific tournament sizes
    switch(totalTeams) {
      // 4-8 team tournaments
      case 4:
        return '-.5rem'
      case 5:
        return '4.5rem'
      case 6:
        return '4.5rem'
      case 7:
        return '8rem'
      case 8:
        return '6.5rem';
      
      // 9-12 team tournaments
      case 9:
      case 10:
      case 11:
      case 12:
        return '13rem';
      
      // 13 team tournament
      case 13:
        return '15rem';
      
      // 14 team tournament
      case 14:
        return '15rem';
      
      // 15 team tournament
      case 15:
        return '17.5rem';
      
      // 16+ team tournaments
      case 16:
        return '24rem';
      
      // 17-31 team tournaments can be added here with specific values
      case 17:
      case 18:
      case 19:
      case 20: 
      case 21:
      case 22:
      case 23:
      case 24:
        return '25.5rem';
      
      case 25:
        return '29.5rem';
      case 26:
        return '33rem';
      case 27:
        return '33.5rem';
      case 28:
        return '33.5rem';
      case 29:
        return '40.5rem';
      case 30:
        return '42rem';
      case 31:
        return '45.5rem';
      case 32:
        return '47rem';
      
      // Default for any other size
      default:
        return '4rem';
    }
  };

  // Get the appropriate spacing function based on round
  const getAdditionalSpacing = (matchIndex) => {
    // Handle championship rounds first
    if (round.round_number >= 98) {
      return championshipAdditionalSpacing(matchIndex);
    }

    // Handle normal rounds
    switch(round.round_number) {
      case 1:
        return round1AdditionalSpacing(matchIndex);
      case 2:
        return round2AdditionalSpacing(matchIndex);
      case 3:
        return round3AdditionalSpacing(matchIndex);
      case 4:
        return round4AdditionalSpacing(matchIndex);
      case 5:
        return round5AdditionalSpacing(matchIndex);
      default:
        return '0';
    }
  };

  // Justification logic
  const getJustification = () => {
    const isPerfectBracket = totalTeams === 4 || totalTeams === 8 || 
                            totalTeams === 16 || totalTeams === 32;

    if (isPerfectBracket) {
      return 'justify-center';
    }

    if (round.round_number <= 2) {
      return 'justify-start';
    }

    return 'justify-start';
  };

  // The return statement should use getRoundSpacing
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`flex flex-col items-center min-h-[300px] ${getJustification()} ${getRoundSpacing()}`}
        style={{
          paddingTop: getJustification() === 'justify-start' ? '0rem' : '0'
        }}
      >
        {sortedMatches.map((match, index) => (
          <div
            key={match.id}
            style={{ 
              marginTop: getAdditionalSpacing(index)  // Here's where we use it
            }}
          >
            <MatchCard 
              match={match}
              onMatchClick={onMatchClick}
              allMatches={allMatches}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WinnersBracketRoundColumn;