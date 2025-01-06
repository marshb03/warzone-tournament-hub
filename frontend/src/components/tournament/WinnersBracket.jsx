import React, { useState, useRef, useEffect } from 'react';
import { Trophy, ChevronRight, ChevronLeft } from 'lucide-react';

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
    // Championship match styling
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

  // Regular match styling
  return (
    <div className="bg-gray-800 rounded p-1 w-64 cursor-pointer hover:bg-gray-700 transition-all duration-200">
      <div 
        onClick={() => onMatchClick(match)}
      >
        <div className="text-xs text-gray-400 px-2 py-0.25">
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

const RoundColumn = ({ round, matches, onMatchClick, allMatches }) => {
  const sortedMatches = React.useMemo(() => {
    return [...matches].sort((a, b) => a.match_number - b.match_number);
  }, [matches]);

  // Calculate spacing based on round
  const getRoundSpacing = () => {
    switch (round.round_number) {
      case 1: return 'gap-6';  // Slightly more space for R1
      case 2: return 'gap-32';  // Double the space for R2
      case 3: return 'gap-80';
      default: return 'gap-96'; // Maximum space for finals
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-medium mb-4 text-center text-blue-500">
        {round.round_name || `Round ${round.round_number}`}
      </div>
      <div className={`flex flex-col justify-center items-center ${getRoundSpacing()}`}>
        {sortedMatches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            onMatchClick={onMatchClick}
            allMatches={allMatches}
          />
        ))}
      </div>
    </div>
  );
};

const WinnersBracket = ({ matches = [], canManage = false, onMatchUpdate, totalTeams }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);

  const getRoundName = (roundNumber, teamCount) => {
    // Handle championship matches
    if (roundNumber >= 98) {
      return roundNumber === 98 ? 'Championship' : 'Championship Reset';
    }

    // For 4 teams
    if (teamCount <= 4) {
      return roundNumber === 1 ? 'Round 1' : 'Finals';
    }

    // For 5-8 teams
    if (teamCount <= 8) {
      switch(roundNumber) {
        case 1: return 'Round 1';
        case 2: return 'Semifinals';
        case 3: return 'Finals';
        default: return `Round ${roundNumber}`;
      }
    }

    // For 9-16 teams
    if (teamCount <= 16) {
      switch(roundNumber) {
        case 1: return 'Round 1';
        case 2: return 'Round 2';
        case 3: return 'Semifinals';
        case 4: return 'Finals';
        default: return `Round ${roundNumber}`;
      }
    }

    // For 17-32 teams
    switch(roundNumber) {
      case 1: return 'Round 1';
      case 2: return 'Round 2';
      case 3: return 'Round 3';
      case 4: return 'Semifinals';
      case 5: return 'Finals';
      default: return `Round ${roundNumber}`;
    }
  };

  const rounds = React.useMemo(() => {
    const roundsMap = matches.reduce((acc, match) => {
      if (!acc[match.round]) {
        acc[match.round] = {
          round_number: match.round,
          round_name: getRoundName(match.round, totalTeams),
          matches: []
        };
      }
      acc[match.round].matches.push(match);
      return acc;
    }, {});

    return Object.values(roundsMap).sort((a, b) => a.round_number - b.round_number);
  }, [matches, totalTeams]);

  const handleScroll = (direction) => {
    if (!containerRef.current) return;
    
    const scrollAmount = direction === 'left' ? -300 : 300;
    const newPosition = scrollPosition + scrollAmount;
    
    containerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };

  const handleMatchClick = (match) => {
    if (!canManage) return;
    if (match.team1_id && match.team2_id) {
      onMatchUpdate(match);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScroll = () => {
      setScrollPosition(container.scrollLeft);
    };

    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    checkScroll();

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  if (!matches.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Winners bracket will be available once matches are generated</p>
      </div>
    );
  }

  const showLeftScroll = scrollPosition > 0;
  const showRightScroll = containerRef.current && 
    scrollPosition < containerRef.current.scrollWidth - containerRef.current.clientWidth;

  return (
    <div className="relative">
      {/* Scroll Controls */}
      {showLeftScroll && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      
      {showRightScroll && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Bracket Content */}
      <div 
        ref={containerRef}
        className="overflow-x-auto hide-scrollbar"
      >
        <div className="flex justify-center items-center gap-28 p-8 min-w-max">
          {rounds.map((round) => (
            <RoundColumn
              key={round.round_number}
              round={round}
              matches={round.matches}
              onMatchClick={handleMatchClick}
              allMatches={matches}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WinnersBracket;