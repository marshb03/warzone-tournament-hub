import React from 'react';
import { X } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

const MatchUpdateModal = ({ match, onClose, onUpdate }) => {
  const handleTeamSelect = async (teamId, teamName) => {
    if (window.confirm(`Advance ${teamName} to the next round?`)) {
      try {
        await onUpdate({
          match_id: match.id,
          winner_id: teamId
        });
        onClose();
      } catch (error) {
        console.error('Failed to update match:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#1A237E] rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Select Winner</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Team Selection */}
        <div className="space-y-4">
          {/* Team 1 Button */}
          <button
            onClick={() => handleTeamSelect(match.team1_id, match.team1?.name || `Team ${match.team1_id}`)}
            className="w-full p-4 bg-[#121212] hover:bg-[#2979FF]/10 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{match.team1?.name || `Team ${match.team1_id}`}</span>
              <ChevronRight className="h-5 w-5 text-[#2979FF]" />
            </div>
          </button>

          {/* Team 2 Button */}
          <button
            onClick={() => handleTeamSelect(match.team2_id, match.team2?.name || `Team ${match.team2_id}`)}
            className="w-full p-4 bg-[#121212] hover:bg-[#2979FF]/10 rounded-lg text-left transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{match.team2?.name || `Team ${match.team2_id}`}</span>
              <ChevronRight className="h-5 w-5 text-[#2979FF]" />
            </div>
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          Click on a team to advance them to the next round
        </div>
      </div>
    </div>
  );
};

export default MatchUpdateModal;