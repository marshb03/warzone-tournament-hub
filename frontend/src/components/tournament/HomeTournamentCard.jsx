// src/components/tournament/HomeTournamentCard.jsx
import React from 'react';
import { Users, Trophy, Calendar, Clock, Gamepad2, DollarSign, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    PENDING: 'bg-yellow-500/20 text-yellow-500',
    ONGOING: 'bg-green-500/20 text-green-500',
    COMPLETED: 'bg-blue-500/20 text-blue-500',
    CANCELLED: 'bg-red-500/20 text-red-500'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
};

const HomeTournamentCard = ({ tournament }) => {
  const navigate = useNavigate();
  const {
    id,
    name,
    format,
    start_date,
    start_time,
    status,
    team_size,
    max_teams,
    current_teams = 0,
    creator_username,
    entry_fee,
    game,
    game_mode
  } = tournament;

  const formatTournamentFormat = (format) => {
    switch(format) {
      case 'SINGLE_ELIMINATION': return 'Single Elimination';
      case 'DOUBLE_ELIMINATION': return 'Double Elimination';
      case 'TKR': return 'TKR';
      default: return format?.replace('_', ' ') || 'Single Elimination';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isTKR = format === 'TKR';

  return (
    <div 
      className="bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer w-full"
      onClick={() => navigate(`/tournaments/${id}`)}
    >
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
            <p className="text-lg text-gray-300">
              Hosted by {creator_username}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Game Information Row - Fixed spacing with flex layout */}
        <div className="mb-6 flex items-center space-x-12">
          <div className="flex items-center text-gray-300">
            <Gamepad2 className="h-6 w-6 text-[#2979FF] mr-3" />
            <div>
              <p className="text-sm opacity-75">Game</p>
              <p className="text-base font-medium">{game || 'Call of Duty: Warzone'}</p>
            </div>
          </div>
          
          {game_mode && (
            <div className="flex items-center text-gray-300">
              <Target className="h-6 w-6 text-[#2979FF] mr-3" />
              <div>
                <p className="text-sm opacity-75">Mode</p>
                <p className="text-base">{game_mode}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center text-gray-300">
            <DollarSign className="h-6 w-6 text-[#2979FF] mr-3" />
            <div>
              <p className="text-sm opacity-75">Entry Fee</p>
              <p className={`text-base font-medium ${entry_fee && entry_fee !== 'Free' ? 'text-green-400 font-bold' : ''}`}>
                {entry_fee || 'Free'}
              </p>
            </div>
          </div>
        </div>

        {/* Tournament Details - Better distributed spacing */}
        <div className="grid grid-cols-2 gap-12 mb-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="flex items-center text-gray-300">
              <Calendar className="h-6 w-6 text-[#2979FF] mr-4" />
              <div>
                <p className="text-sm opacity-75">Date</p>
                <p className="text-base">{formatDate(start_date)}</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-300">
              <Clock className="h-6 w-6 text-[#2979FF] mr-4" />
              <div>
                <p className="text-sm opacity-75">Time (EST)</p>
                <p className="text-base">{formatTime(start_time)}</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="flex items-center text-gray-300">
              <Users className="h-6 w-6 text-[#2979FF] mr-4" />
              <div>
                <p className="text-sm opacity-75">Team Size</p>
                <p className="text-base">{team_size} Players</p>
              </div>
            </div>

            <div className="flex items-center text-gray-300">
              <Trophy className="h-6 w-6 text-[#2979FF] mr-4" />
              <div>
                <p className="text-sm opacity-75">Format</p>
                <p className="text-base">{formatTournamentFormat(format)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Registration - Different for TKR vs Other Formats */}
        <div className="mt-6">
          {isTKR ? (
            // TKR: Just show team count without progress bar
            <div className="text-center">
              <span className="text-gray-400 text-sm">Teams Registered: </span>
              <span className="text-white font-medium text-sm">{current_teams}</span>
            </div>
          ) : (
            // Single/Double Elimination: Show progress bar
            <>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Teams Registered</span>
                <span className="text-white">{current_teams}/{max_teams}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-[#2979FF] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(current_teams / max_teams) * 100}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeTournamentCard;