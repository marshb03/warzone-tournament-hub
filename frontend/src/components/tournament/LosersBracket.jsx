import React, { useState, useRef, useEffect } from 'react';
import { Trophy, ChevronRight, ChevronLeft } from 'lucide-react';

const MatchCard = ({ match, onMatchClick }) => {

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
    // Get the specific team data and ID based on position
    const team = position === 1 ? match.team1 : match.team2;
    const teamId = position === 1 ? match.team1_id : match.team2_id;

    // If we have a teamId and team data, display it
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

    // If no team assigned yet, show placeholder based on source
    const fromWinners = position === 1 ? match.team1_from_winners : match.team2_from_winners;
    const round = position === 1 ? match.team1_winners_round : match.team2_winners_round;
    const matchNumber = position === 1 ? match.team1_winners_match_number : match.team2_winners_match_number;

    if (fromWinners) {
      return (
        <span className="text-blue-500 text-sm">
          Loser of Winners Round {round} Match {matchNumber}
        </span>
      );
    } else {
      return (
        <span className="text-red-500 text-sm">
          Winner of Losers Match {matchNumber}
        </span>
      );
    }
  };

  return (
    <div className="bg-gray-800 rounded p-1 w-64 cursor-pointer hover:bg-gray-700 transition-all duration-200">
      <div onClick={() => onMatchClick(match)}>
        <div className="text-xs text-gray-400 px-2 py-0.25">
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

const RoundColumn = ({ round, matches, onMatchClick, allMatches }) => {
  const sortedMatches = React.useMemo(() => {
    return [...matches].sort((a, b) => a.match_number - b.match_number);
  }, [matches]);

  // Calculate spacing based on round
  const getRoundSpacing = () => {
    switch (round.round_number) {
      case 1: return 'gap-12';  // Slightly more space for R1
      case 2: return 'gap-12';  // Double the space for R2
      case 3: return 'gap-48';
      case 4: return 'gap-48';
      case 5: return 'gap-96';
      case 6: return 'gap-96';
      default: return 'gap-48'; // Maximum space for finals
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-medium mb-4 text-center text-red-500">
        {round.round_name || `Losers Round ${round.round_number}`}
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

const LosersBracket = ({ matches = [], canManage = false, onMatchUpdate }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);

  // Group matches by round
  const rounds = React.useMemo(() => {
    const roundsMap = matches.reduce((acc, match) => {
      if (!acc[match.round]) {
        acc[match.round] = {
          round_number: match.round,
          round_name: `Losers Round ${match.round}`,
          matches: []
        };
      }
      acc[match.round].matches.push(match);
      return acc;
    }, {});

    return Object.values(roundsMap).sort((a, b) => a.round_number - b.round_number);
  }, [matches]);

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
      if (onMatchUpdate) {
        onMatchUpdate(match);
      }
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
        <p>Losers bracket will be available once matches are generated</p>
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
        <div className="flex justify-center items-center gap-32 p-8 min-w-max">
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

export default LosersBracket;