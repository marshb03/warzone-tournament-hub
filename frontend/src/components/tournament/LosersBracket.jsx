// LosersBracket.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Trophy, ChevronRight, ChevronLeft } from 'lucide-react';
import LosersBracketRoundColumn from './roundColumn/LosersBracketRoundColumn';

const LosersBracket = ({ matches = [], canManage = false, onMatchUpdate, totalTeams }) => {
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
          onClick={() => containerRef.current.scrollBy({ left: -300, behavior: 'smooth' })}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      
      {showRightScroll && (
        <button
          onClick={() => containerRef.current.scrollBy({ left: 300, behavior: 'smooth' })}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      <div ref={containerRef} className="overflow-x-auto hide-scrollbar">
        <div className="min-w-max">
          {/* Title row */}
          <div className="flex gap-28 px-7 mb-4">
            {rounds.map((round) => (
              <div 
                key={`title-${round.round_number}`} 
                className="w-72 text-lg font-medium text-center text-red-500"  // Same width as match cards
              >
                {round.round_name}
              </div>
            ))}
          </div>

          {/* Rounds row */}
          <div className="flex gap-28 p-8">
            {rounds.map((round) => (
              <LosersBracketRoundColumn
                key={round.round_number}
                round={round}
                matches={round.matches}
                onMatchClick={(match) => canManage && onMatchUpdate(match)}
                allMatches={matches}
                totalTeams={totalTeams}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LosersBracket;