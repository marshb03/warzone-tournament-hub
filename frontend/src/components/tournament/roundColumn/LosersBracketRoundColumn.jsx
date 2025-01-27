// LosersBracketRoundColumn.jsx
import React from 'react';
import LosersMatchCard from './LosersMatchCard';  // Update import

const LosersBracketRoundColumn = ({ round, matches, onMatchClick, allMatches, totalTeams }) => {
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
          case 1: return 'gap-8';
          case 2: return 'gap-8';
          case 3: return 'gap-8';
          default: return 'gap-96';
        }
      } else if (totalTeams <= 16) {
        switch(round.round_number) {
          case 1: return 'gap-8';
          case 2: return 'gap-8';
          case 3: return 'gap-20';
          case 4: return 'gap-20';
          default: return 'gap-96';
        }
      } else {
        // 32 teams
        switch(round.round_number) {
          case 1: return 'gap-8';
          case 2: return 'gap-8';
          case 3: return 'gap-8';
          case 4: return 'gap-8';
          case 5: return 'gap-8';
          case 6: return 'gap-8';
          case 7: return 'gap-8';
          case 8: return 'gap-8';
          default: return 'gap-96';
        }
      }
    }

    // For non-power-of-2 tournament sizes
    // For tournaments with 5-7 teams
    if (totalTeams <= 7) {
      switch(round.round_number) {
        case 1: return 'gap-8';
        case 2: return 'gap-16';
        case 3: return 'gap-32';
        default: return 'gap-48';
      }
    }

    // For tournaments with 9-12 teams
    if (totalTeams <= 12) {
      switch(round.round_number) {
        case 1: return 'gap-8';
        case 2: return 'gap-8';
        case 3: return 'gap-8';
        case 4: return 'gap-8';
        default: return 'gap-64';
      }
    }

    // For tournaments with 13-15 teams
    if (totalTeams <= 15) {
      switch(round.round_number) {
        case 1: return 'gap-8';
        case 2: return 'gap-8';
        case 3: return 'gap-8';
        case 4: return 'gap-8';
        default: return 'gap-64';
      }
    }

    // For tournaments with 17-24 teams
    if (totalTeams <= 24) {
      switch(round.round_number) {
        case 1: return 'gap-6';
        case 2: return 'gap-6';
        case 3: return 'gap-6';
        case 4: return 'gap-6';
        case 5: return 'gap-6';
        default: return 'gap-64';
      }
    }

    // For tournaments with 25-31 teams
    if (totalTeams < 32) {
      switch(round.round_number) {
        case 1: return 'gap-6';
        case 2: return 'gap-6';
        case 3: return 'gap-12';
        case 4: return 'gap-12';
        case 5: return 'gap-12';
        case 6: return 'gap-12';
        case 7: return 'gap-12';
        case 8: return 'gap-12';
        default: return 'gap-64';
      }
    }

    return 'gap-32'; // Default fallback
  };

  // Round 1 precise additional spacing
  const round1AdditionalSpacing = (matchIndex) => {
    const isPerfectBracket = totalTeams === 4 || totalTeams === 8 || 
                            totalTeams === 16 || totalTeams === 32;
    
    if (isPerfectBracket || round.round_number !== 1) return '0';

    switch(totalTeams) {
      case 5:
        switch(matchIndex) {
          case 0: return '3.5rem';
          default: return '0';
        }

      case 6:
        switch(matchIndex) {
          case 0: return '0';
          default: return '0';
        }

      case 7:
        switch(matchIndex) {
          case 0: return '9.25rem';
          case 1: return '0rem';
          default: return '0';
        }

      case 9:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '0rem';
          default: return '0';
        }

      case 10:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '0rem';
          case 2: return '0rem';
          default: return '0';
        }

      case 11:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '0rem';
          case 2: return '0rem';
          default: return '0';
        }

      case 12:
        switch(matchIndex) {
          case 0: return '0';
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          default: return '0';
        }

      case 13:
        switch(matchIndex) {
          case 0: return '7.5rem';
          default: return '0';
        }

      case 14:
        switch(matchIndex) {
          case 0: return '7.5rem';
          case 1: return '7rem';
          default: return '0';
        }

      case 15:
        switch(matchIndex) {
          case 0: return '7.25rem';
          case 1: return '0rem';
          case 2: return '0rem';;
          default: return '0';
        }

      // For larger tournaments (17-31)
      case 17:
        switch(matchIndex) {
          case 0: return '0';
          default: return '0';
        }
      case 18:
        switch(matchIndex) {
          case 0: return '0';
          case 1: return '6.5rem';
          default: return '0';
        }
      case 19:
        switch(matchIndex) {
          case 0: return '0';
          case 1: return '6.5rem';
          case 2: return '0rem';
          default: return '0';
        }

      case 20:
      case 21:
      case 22:
      case 23:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          case 4: return '0rem';
          case 5: return '0rem';
          case 6: return '0rem';
          case 7: return '0rem';
          default: return '0';
        }

      case 24:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          case 4: return '0rem';
          case 5: return '0rem';
          case 6: return '0rem';
          case 7: return '0rem';
          default: return '0';
        }
      case 25:
        switch(matchIndex) {
          case 0: return '6.5rem';
          default: return '0';
        }
      case 26:
        switch(matchIndex) {
          case 0: return '6.5rem';
          case 1: return '19.5rem';
          default: return '0';
        }
      case 27:
        switch(matchIndex) {
          case 0: return '6.75rem';
          case 1: return '7rem';
          case 2: return '20rem';
          default: return '0';
        }

      case 28:
        switch(matchIndex) {
          case 0: return '6.75rem';
          case 1: return '7rem';
          case 2: return '6.25rem';
          case 3: return '7rem';
          default: return '0';
        }
      case 29:
        switch(matchIndex) {
          case 0: return '6.5rem';
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '7rem';
          case 4: return '6.75rem';
          default: return '0';
        }
      case 30:
        switch(matchIndex) {
          case 0: return '6.5rem';
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '6.75rem';
          case 4: return '0rem';
          case 5: return '0rem';
          default: return '0';
        }
      case 31:
        switch(matchIndex) {
          case 0: return '6.75rem';
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          case 4: return '0rem';
          case 5: return '0rem';
          case 6: return '0rem';
          default: return '0';
        }

      default: return '0';
    }
  };

  // Round 2 precise additional spacing
  const round2AdditionalSpacing = (matchIndex) => {
    const isPerfectBracket = totalTeams === 4 || totalTeams === 8 || 
                            totalTeams === 16 || totalTeams === 32;
    
    if (isPerfectBracket || round.round_number !== 2) return '0';

    switch(totalTeams) {
      case 5:
        switch(matchIndex) {
          case 0: return '3.5rem';
          default: return '0';
        }

      case 6:
        switch(matchIndex) {
          case 0: return '3.5rem';
          default: return '0';
        }

      case 7:
        switch(matchIndex) {
          case 0: return '0';
          case 1: return '0rem';
          default: return '0';
        }

      case 9:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '0rem';
          default: return '0';
        }

      case 10:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '0rem';
          default: return '0';
        }

      case 11:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '3.5rem';
          default: return '0';
        }

      case 12:
        switch(matchIndex) {
          case 0: return '4rem';
          case 1: return '7rem';
          default: return '0';
        }

      case 13:
      case 14:
      case 15:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          case 4: return '0rem';
          default: return '0';
        }

      // For larger tournaments (17-31)
      case 17:
      case 18:
      case 19:
      case 20:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          default: return '0';
        }
      case 21:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '3.25rem';
          case 2: return '3.5rem';
          case 3: return '0rem';
          default: return '0';
        }
      case 22:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '3.25rem';
          case 2: return '3.5rem';
          case 3: return '3.5rem';
          default: return '0';
        }
      case 23:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '3.5rem';
          case 2: return '6.75rem';
          case 3: return '7rem';
          default: return '0';
        }
      case 24:
        switch(matchIndex) {
          case 0: return '4rem';
          case 1: return '6rem';
          case 2: return '6.5rem';
          case 3: return '7rem';
          default: return '0';
        }
      case 25:
      case 26:
      case 27:
      case 28:
      case 29:
      case 30:
      case 31:
        switch(matchIndex) {
          case 0: return '0rem';
          case 1: return '0rem';
          case 2: return '0rem';
          case 3: return '0rem';
          case 4: return '0rem';
          case 5: return '0rem';
          case 6: return '0rem';
          case 7: return '0rem';
          case 8: return '0rem';
          default: return '0';
        }

      default: return '0';
    }
  };

  // General spacing for later rounds
  const getLaterRoundSpacing = (matchIndex) => {
    if (round.round_number <= 2) return '0';

    // For 5-8 team tournaments
    if (totalTeams <= 8) {
      switch(round.round_number) {
        case 3:
        case 4:
          return '0rem';
        default:
          return '12rem';
      }
    }

    // For 9 team tournaments
    if (totalTeams === 9) {
      switch(round.round_number) {
        case 3:
          switch(matchIndex) {
            case 0: return '0rem';
            case 1: return '0rem';
            default: return '0';
          }
        case 4:
        case 5:
          return '0rem';
        default:
          return '24rem';
      }
    }

    // For 10 team tournaments
    if (totalTeams === 10) {
      switch(round.round_number) {
        case 3:
          switch(matchIndex) {
            case 0: return '0rem';
            case 1: return '0rem';
            default: return '0';
          }
        case 4:
        case 5:
          return '0rem';
        default:
          return '24rem';
      }
    }

    // For 11 team tournaments
    if (totalTeams === 11) {
      switch(round.round_number) {
        case 3:
          switch(matchIndex) {
            case 0: return '0rem';
            case 1: return '3.5rem';
            default: return '0';
          }
        case 4:
        case 5:
          return '3.5rem';
        default:
          return '24rem';
      }
    }

    // For 12 team tournaments
    if (totalTeams === 12) {
      switch(round.round_number) {
        case 3:
          switch(matchIndex) {
            case 0: return '4rem';
            case 1: return '7rem';
            default: return '0';
          }
        case 4:
        case 5:
          return '9rem';
        default:
          return '24rem';
      }
    }

    // For 13-15 team tournaments
    if (totalTeams <= 15) {
      switch(round.round_number) {
        case 3:
        case 4:
          switch(matchIndex) {
            case 0: return '4rem';
            case 1: return '7rem';
            default: return '0';
          }  
        case 5:
        case 6:
          return '8rem';
        default:
          return '26rem';
      }
    }

    // For 16 team tournaments
    if (totalTeams === 16) {
      switch(round.round_number) {
        case 3:
        case 4:
          return '4rem';
        case 5:
        case 6:
          return '8.5rem';
        default:
          return '26rem';
      }
    }

    //For 17-20 team tournaments
    if (totalTeams <= 20) {
      switch(round.round_number) {
        case 3:
          switch(matchIndex) {
            case 0: return '0rem';
            case 1: return '0rem';
            case 2: return '0rem';
            case 3: return '0rem';
            default: return '0';
          }
        case 4:
        case 5:
          switch(matchIndex) {
            case 0: return '3rem';
            case 1: return '6.5rem';
            default: return '24rem';
          }
        case 6:
        case 7:
          return '5rem';
        default:
          return '32rem';
      }
    }

    //For 21 team tournaments
    if (totalTeams === 21) {
      switch(round.round_number) {
        case 3:
          switch(matchIndex) {
            case 0: return '0rem';
            case 1: return '3.25rem';
            case 2: return '3.5rem';
            case 3: return '0rem';
            default: return '0';
          }
        case 4:
        case 5:
          switch(matchIndex) {
            case 0: return '5rem';
            case 1: return '11.5rem';
            default: return '24rem';
          }
        case 6:
        case 7:
          return '14rem';
        default:
          return '32rem';
      }
    }

    //For 22 team tournaments
    if (totalTeams === 22) {
      switch(round.round_number) {
        case 3:
          switch(matchIndex) {
            case 0: return '0rem';
            case 1: return '3.25rem';
            case 2: return '3.5rem';
            case 3: return '3.5rem';
            default: return '0';
          }
        case 4:
        case 5:
          switch(matchIndex) {
            case 0: return '5rem';
            case 1: return '14rem';
            default: return '24rem';
          }
        case 6:
        case 7:
          return '15.25rem';
        default:
          return '32rem';
      }
    }

    //For 23 team tournaments
    if (totalTeams === 23) {
      switch(round.round_number) {
        case 3:
          switch(matchIndex) {
            case 0: return '0rem';
            case 1: return '3.5rem';
            case 2: return '6.75rem';
            case 3: return '7rem';
            default: return '0';
          }
        case 4:
        case 5:
          switch(matchIndex) {
            case 0: return '5rem';
            case 1: return '19rem';
            default: return '24rem';
          }
        case 6:
        case 7:
          return '17.5rem';
        default:
          return '32rem';
      }
    }

    // For 24 team tournaments
    if (totalTeams === 24) {
      switch(round.round_number) {
        case 3:
          switch(matchIndex) {
            case 0: return '4rem';
            case 1: return '6rem';
            case 2: return '6.5rem';
            case 3: return '7rem';
            default: return '0';
          }
        case 4:
        case 5:
          switch(matchIndex) {
            case 0: return '10rem';
            case 1: return '20rem';
            default: return '24rem';
          }
        case 6:
        case 7:
          return '24rem';
        default:
          return '32rem';
      }
    }

    // For 25-31 team tournaments
    if (totalTeams < 32) {
      switch(round.round_number) {
        case 3:
          switch(matchIndex) {
            case 0: return '3.5rem';
            case 1: return '4.5rem';
            case 2: return '5.5rem';
            case 3: return '4.5rem';
            default: return '24rem';
          }
        case 4:
          switch(matchIndex) {
            case 0: return '3.5rem';
            case 1: return '4.5rem';
            case 2: return '5.5rem';
            case 3: return '4.5rem';
            default: return '24rem';
          }
        case 5:
          switch(matchIndex) {
            case 0: return '10rem';
            case 1: return '17.5rem';
            default: return '32rem';
          }
        case 6:
          switch(matchIndex) {
            case 0: return '10rem';
            case 1: return '17.5rem';
            default: return '32rem';
          }
        case 7:
        case 8:
          return '23rem'
        default:
          return '36rem';
      }
    }

    // For 32 team tournaments (perfect bracket)
    if (totalTeams === 32) {
      switch(round.round_number) {
        case 3:
        case 4:
          switch(matchIndex) {
            case 0: return '3.5rem';
            case 1: return '7.5rem';
            case 2: return '6.5rem';
            case 3: return '6.5rem';
            default: return '24rem';
          }
        case 5:
        case 6:
          switch(matchIndex) {
            case 0: return '10.5rem';
            case 1: return '20.5rem';
            default: return '32rem';
          }
        case 7:
        case 8:
          return '24rem';
        default:
          return '48rem';
      }
    }

    return '0';
  };

  // Get the appropriate spacing function based on round
  const getAdditionalSpacing = (matchIndex) => {
    switch(round.round_number) {
      case 1:
        return round1AdditionalSpacing(matchIndex);
      case 2:
        return round2AdditionalSpacing(matchIndex);
      default:
        return getLaterRoundSpacing(matchIndex);
    }
  };

  // Justification logic - first two rounds start-aligned, rest centered
  const getJustification = () => {
    if (round.round_number <= 2) {
      return 'justify-start';
    }
    return 'justify-center';
  };

  // Update the return section to handle padding based on justification
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`flex flex-col items-center min-h-[200px] ${getJustification()} ${getRoundSpacing()}`}
        style={{
          paddingTop: getJustification() === 'justify-start' ? '0rem' : '0'
        }}
      >
        {sortedMatches.map((match, index) => (
          <div
            key={match.id}
            style={{ 
              marginTop: getAdditionalSpacing(index)
            }}
          >
            <LosersMatchCard 
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

export default LosersBracketRoundColumn;