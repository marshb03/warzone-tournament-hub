// src/components/tournament/HomeTournamentCard.jsx
import React from 'react';
import { Users, Trophy, Calendar, Clock } from 'lucide-react';
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
    creator_username
  } = tournament;

  return (
    <div 
      className="bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer"
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

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Tournament Details */}
          <div className="space-y-4">
            <div className="flex items-center text-gray-300">
              <Calendar className="h-6 w-6 text-[#2979FF] mr-3" />
              <div>
                <p className="text-sm opacity-75">Date</p>
                <p className="text-base">{new Date(start_date).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-300">
              <Clock className="h-6 w-6 text-[#2979FF] mr-3" />
              <div>
                <p className="text-sm opacity-75">Time</p>
                <p className="text-base">{start_time}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center text-gray-300">
              <Users className="h-6 w-6 text-[#2979FF] mr-3" />
              <div>
                <p className="text-sm opacity-75">Team Size</p>
                <p className="text-base">{team_size} Players</p>
              </div>
            </div>

            <div className="flex items-center text-gray-300">
              <Trophy className="h-6 w-6 text-[#2979FF] mr-3" />
              <div>
                <p className="text-sm opacity-75">Format</p>
                <p className="text-base">{format.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
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
        </div>
      </div>
    </div>
  );
};

export default HomeTournamentCard;