// src/components/tournament/TournamentCard.jsx
import React from 'react';
import { Calendar, Users, Trophy, Clock, ChevronRight, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { UserRole } from '../../types/user';

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

const TournamentCard = ({ tournament, isOwner, userRole }) => {
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

  const canManageTournament = 
    userRole === UserRole.SUPER_ADMIN || 
    (userRole === UserRole.HOST && isOwner);

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

  const formatTournamentFormat = (format) => {
    switch(format) {
      case 'SINGLE_ELIMINATION': return 'Single Elimination';
      case 'DOUBLE_ELIMINATION': return 'Double Elimination';
      case 'TKR': return 'TKR';
      default: return format?.replace('_', ' ') || 'Single Elimination';
    }
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#2979FF]/10 cursor-pointer group
        ${isOwner ? 'border-10 border-[#2979FF]/50' : ''}`}
      onClick={() => navigate(`/tournaments/${id}`)}
    >
      <div className="p-4 bg-[#1A237E]">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-white">{name}</h3>
            <p className="text-lg text-gray-300">
              Hosted by {creator_username || 'Unknown'}
              {isOwner && <span className="ml-2 text-[#2979FF]">(You)</span>}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Game and Entry Fee Row */}
        <div className="flex items-center justify-between text-gray-300 text-sm mt-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Gamepad2 className="h-4 w-4 mr-1" />
              <span>{game || 'Call of Duty: Warzone'}</span>
            </div>
            {game_mode && (
              <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                {game_mode}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <span className={`font-medium ${entry_fee && entry_fee !== 'Free' ? 'text-green-400 font-bold' : ''}`}>
              {entry_fee || 'Free'}
            </span>
          </div>
        </div>

        {/* Date and Time Row */}
        <div className="flex items-center text-gray-300 text-sm mt-2 space-x-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(start_date)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formatTime(start_time)} EST</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center text-gray-300">
            <Users className="h-5 w-5 mr-2 text-[#2979FF]" />
            <div>
              <p className="text-sm">Team Size</p>
              <p className="font-medium text-white">{team_size} Players</p>
            </div>
          </div>
          <div className="flex items-center text-gray-300">
            <Trophy className="h-5 w-5 mr-2 text-[#2979FF]" />
            <div>
              <p className="text-sm">Format</p>
              <p className="font-medium text-white">
                {formatTournamentFormat(format)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Teams Registered</span>
            <span className="text-white font-medium">
              {format === 'TKR' 
                ? `${current_teams} teams`
                : `${current_teams}/${max_teams}`
              }
            </span>
          </div>
          {/* Only show progress bar for non-TKR tournaments */}
          {format !== 'TKR' && (
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-[#2979FF] h-2 rounded-full transition-all duration-500"
                style={{ width: `${(current_teams / max_teams) * 100}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex space-x-2">
            {canManageTournament && status === 'PENDING' && (
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/tournaments/${id}/edit`);
                }}
                className="text-sm hover:bg-[#2979FF]/10"
              >
                Edit
              </Button>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#2979FF] transform group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Card>
  );
};

export default TournamentCard;