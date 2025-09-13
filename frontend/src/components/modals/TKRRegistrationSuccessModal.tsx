// src/components/modals/TKRRegistrationSuccessModal.tsx
import React from 'react';
import { CheckCircle, Clock, Calendar, Users, DollarSign, ArrowRight, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface TKRRegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: {
    id: number;
    team_name: string;
    team_rank: number;
    start_time: string;
    players: Array<{ name: string; rank?: number }>;
    using_free_entry?: boolean;
    is_rerunning?: boolean;
  };
  tournament: {
    name: string;
    entry_fee: string;
  };
  entryFeeCalculation?: {
    final: number;
  };
  onViewTournament?: () => void;
}

const TKRRegistrationSuccessModal: React.FC<TKRRegistrationSuccessModalProps> = ({
  isOpen,
  onClose,
  registration,
  tournament,
  entryFeeCalculation,
  onViewTournament
}) => {
  if (!isOpen) return null;

  const formatStartTime = (startTime: string) => {
    try {
      const date = new Date(startTime);
      return {
        date: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          timeZoneName: 'short'
        })
      };
    } catch (error) {
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };

  const { date, time } = formatStartTime(registration.start_time);

  const getPaymentStatus = () => {
    if (registration.using_free_entry) {
      return 'Free Entry Used';
    } else if (registration.is_rerunning) {
      return '50% Discount Applied';
    } else if (tournament.entry_fee === 'Free') {
      return 'Free Tournament';
    } else {
      return `$${entryFeeCalculation?.final?.toFixed(2) || '0.00'} Payment Required`;
    }
  };

  const getPaymentStatusColor = () => {
    if (registration.using_free_entry || tournament.entry_fee === 'Free') {
      return 'text-green-400';
    } else if (registration.is_rerunning) {
      return 'text-blue-400';
    } else {
      return 'text-yellow-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-gray-900 border-green-500/30">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Registration Successful!</h2>
                <p className="text-gray-400 text-sm">Your team is now registered</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Team Information */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-400" />
              Team Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Team Name:</span>
                <span className="text-white font-medium">{registration.team_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Team Rank:</span>
                <span className="text-white font-medium">{registration.team_rank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Players:</span>
                <span className="text-white font-medium">{registration.players.length}</span>
              </div>
            </div>
          </div>

          {/* Start Time Information */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-400" />
              Your Designated Start Time
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="text-white font-medium">{date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-white font-medium">{time}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-400" />
              Payment Status
            </h3>
            <p className={`text-sm font-medium ${getPaymentStatusColor()}`}>
              {getPaymentStatus()}
            </p>
          </div>

          {/* What's Next */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">What's Next?</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start space-x-2">
                <ArrowRight className="h-4 w-4 text-green-400 mt-0.5" />
                <span>
                  Be ready to start playing at your designated time: <strong>{time}</strong>
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowRight className="h-4 w-4 text-green-400 mt-0.5" />
                <span>
                  You'll have the tournament duration to complete your games
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowRight className="h-4 w-4 text-green-400 mt-0.5" />
                <span>
                  Submit your game scores using the "Submit Scores" tab
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowRight className="h-4 w-4 text-green-400 mt-0.5" />
                <span>
                  Track your performance on the live leaderboard
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
          {onViewTournament && (
            <Button
              variant="primary"
              onClick={onViewTournament}
              className="flex items-center"
            >
              View Tournament
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TKRRegistrationSuccessModal;