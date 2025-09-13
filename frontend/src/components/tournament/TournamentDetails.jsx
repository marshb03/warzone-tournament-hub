// src/components/tournament/TournamentDetails.jsx - Updated with layout changes
import React, { useState, useEffect } from 'react';
import { 
  Edit2, Calendar, Clock, Users, Trophy, Target, Gamepad2, 
  DollarSign, MapPin, Timer, Zap, Award, Gift, Info, AlertCircle,
  CheckCircle, Star
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';

const TournamentDetails = ({ tournament, onUpdate, canManage, tkrConfig, prizePool, appliedTemplate }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [formData, setFormData] = useState({
      name: tournament.name,
      format: tournament.format,
      start_date: tournament.start_date?.split('T')[0],
      start_time: tournament.start_time,
      end_date: tournament.end_date?.split('T')[0] || '',
      end_time: tournament.end_time || '',
      team_size: tournament.team_size,
      max_teams: tournament.max_teams,
      description: tournament.description || '',
      rules: tournament.rules || '',
      entry_fee: tournament.entry_fee || 'Free',
      entry_fee_amount: '',
      game: tournament.game || 'Call of Duty: Warzone',
      custom_game: '',
      game_mode: tournament.game_mode || 'Battle Royale',
      custom_game_mode: '',
      // FIXED: Handle both payment_methods and payment_method fields
      payment_methods: tournament.payment_methods || '',
      payment_details: tournament.payment_details || '',
      payment_instructions: tournament.payment_instructions || ''
    });

  // Helper function to parse payment methods safely
    const parsePaymentMethods = (paymentMethodsString) => {
      if (!paymentMethodsString) return [];
      
      try {
        const parsed = JSON.parse(paymentMethodsString);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('Failed to parse payment methods:', error);
        return [];
      }
    };

    // Game and game mode options
    const gameOptions = [
      'Call of Duty: Warzone',
      'Battlefield 6',
      'Black Ops 7',
      'Other'
    ];

    const gameModeOptions = [
      'Battle Royale',
      'Resurgence',
      'Multiplayer',
      'Other'
    ];

    const paymentMethods = [
      'PayPal',
      'Venmo',
      'CashApp',
      'Zelle',
      'Bank Transfer',
      'Other'
    ];

    const isTKR = tournament.format === 'TKR';

    // Enhanced countdown timer for TKR tournaments
    useEffect(() => {
      if (!isTKR || !tournament.end_date || !tournament.end_time) return;

      const calculateCountdown = () => {
        const now = new Date();
        const endDate = new Date(`${tournament.end_date}T${tournament.end_time}`);
        const diff = endDate - now;
        
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setCountdown({ days, hours, minutes });
        } else {
          setCountdown(null);
        }
      };

      calculateCountdown();
      const interval = setInterval(calculateCountdown, 60000);
      return () => clearInterval(interval);
    }, [isTKR, tournament.end_date, tournament.end_time]);

    // Format time to 12-hour format
    const formatTime12Hour = (time24) => {
      if (!time24) return 'Not specified';
      const [hours, minutes] = time24.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    // Calculate tournament countdown
    const calculateTimeRemaining = () => {
      const now = new Date();
      const startDate = new Date(tournament.start_date);
      const endDate = tournament.end_date ? new Date(tournament.end_date) : null;
      
      if (now < startDate) {
        const diff = startDate.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return { 
          status: 'starting', 
          days, 
          text: `Starts in ${days} day${days !== 1 ? 's' : ''}`,
          color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
        };
      } else if (endDate && now >= startDate && now <= endDate) {
        const diff = endDate.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const hours = Math.ceil(diff / (1000 * 60 * 60));
        
        if (days > 1) {
          return { 
            status: 'ongoing', 
            days, 
            text: `${days} days remaining`,
            color: 'text-green-400 bg-green-500/20 border-green-500/30'
          };
        } else if (hours > 1) {
          return { 
            status: 'ongoing', 
            hours, 
            text: `${hours} hours remaining`,
            color: 'text-orange-400 bg-orange-500/20 border-orange-500/30'
          };
        } else {
          return { 
            status: 'ending', 
            text: 'Ending soon',
            color: 'text-red-400 bg-red-500/20 border-red-500/30'
          };
        }
      } else if (endDate && now > endDate) {
        return { 
          status: 'ended', 
          text: 'Tournament ended',
          color: 'text-gray-400 bg-gray-500/20 border-gray-500/30'
        };
      } else {
        // Single/Double elimination tournaments
        return { 
          status: 'ongoing', 
          text: 'Tournament ongoing',
          color: 'text-green-400 bg-green-500/20 border-green-500/30'
        };
      }
    };

    // Initialize form data when editing starts
    React.useEffect(() => {
      if (isEditing) {
        if (tournament.entry_fee && tournament.entry_fee !== 'Free') {
          const amount = tournament.entry_fee.replace('$', '');
          setFormData(prev => ({
            ...prev,
            entry_fee: 'Paid',
            entry_fee_amount: amount
          }));
        }

        if (tournament.game && !gameOptions.includes(tournament.game)) {
          setFormData(prev => ({
            ...prev,
            game: 'Other',
            custom_game: tournament.game
          }));
        }

        if (tournament.game_mode && !gameModeOptions.includes(tournament.game_mode)) {
          setFormData(prev => ({
            ...prev,
            game_mode: 'Other',
            custom_game_mode: tournament.game_mode
          }));
        }
      }
    }, [isEditing, tournament]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const updateData = {
            name: formData.name,
            format: formData.format,
            start_date: formData.start_date,
            start_time: formData.start_time,
            end_date: formData.end_date,
            end_time: formData.end_time,
            team_size: parseInt(formData.team_size),
            max_teams: formData.format === 'TKR' ? null : parseInt(formData.max_teams),
            description: formData.description,
            rules: formData.rules,
            entry_fee: getEntryFeeValue(),
            game: getGameValue(),
            game_mode: getGameModeValue(),
            payment_methods: formData.payment_method,
            payment_details: formData.payment_details,
            payment_instructions: formData.payment_instructions
          };

          await onUpdate(updateData);
          setIsEditing(false);
        } catch (error) {
          console.error('Failed to update tournament:', error);
        }
      };

    const getEntryFeeValue = () => {
      if (formData.entry_fee === 'Free') {
        return 'Free';
      }
      const amount = parseFloat(formData.entry_fee_amount);
      return isNaN(amount) ? 'Free' : `$${amount.toFixed(2)}`;
    };

    const getGameValue = () => {
      return formData.game === 'Other' ? formData.custom_game : formData.game;
    };

    const getGameModeValue = () => {
      return formData.game_mode === 'Other' ? formData.custom_game_mode : formData.game_mode;
    };

    const handleEntryFeeTypeChange = (e) => {
      const value = e.target.value;
      setFormData(prev => ({
        ...prev,
        entry_fee: value,
        entry_fee_amount: value === 'Free' ? '' : prev.entry_fee_amount
      }));
    };

    const handleEntryFeeAmountChange = (e) => {
      const value = e.target.value;
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          entry_fee_amount: value
        }));
      }
    };

    const organizePlacementMultipliers = (multipliers) => {
      if (!multipliers || Object.keys(multipliers).length === 0) return [[], [], []];
      
      const sortedEntries = Object.entries(multipliers)
        .sort(([a], [b]) => parseInt(a) - parseInt(b));
      
      const columns = [[], [], []];
      const maxItemsPerColumn = 10; // Maximum items per column
      
      sortedEntries.forEach(([placement, multiplier], index) => {
        if (index < maxItemsPerColumn) {
          // Fill first column completely (up to 10 items)
          columns[0].push([placement, multiplier]);
        } else if (index < maxItemsPerColumn * 2) {
          // Fill second column (items 11-20)
          columns[1].push([placement, multiplier]);
        } else {
          // Fill third column (items 21+)
          columns[2].push([placement, multiplier]);
        }
      });
      
      return columns;
    };

    const organizeBonusPoints = (bonusThresholds) => {
      if (!bonusThresholds || Object.keys(bonusThresholds).length === 0) return [[], [], []];
      
      const sortedEntries = Object.entries(bonusThresholds)
        .sort(([a], [b]) => parseInt(a) - parseInt(b));
      
      const columns = [[], [], []];
      const maxItemsPerColumn = 10; // Maximum items per column
      
      sortedEntries.forEach(([kills, bonus], index) => {
        if (index < maxItemsPerColumn) {
          // Fill first column completely (up to 10 items)
          columns[0].push([kills, bonus]);
        } else if (index < maxItemsPerColumn * 2) {
          // Fill second column (items 11-20)
          columns[1].push([kills, bonus]);
        } else {
          // Fill third column (items 21+)
          columns[2].push([kills, bonus]);
        }
      });
      
      return columns;
    };

    const formatTournamentFormat = (format) => {
      switch(format) {
        case 'SINGLE_ELIMINATION': return 'Single Elimination';
        case 'DOUBLE_ELIMINATION': return 'Double Elimination';
        case 'TKR': return 'TKR';
        default: return format?.replace('_', ' ') || 'Single Elimination';
      }
    };
  
    const canEdit = canManage && (
        user?.role === UserRole.SUPER_ADMIN || 
        (user?.role === UserRole.HOST && tournament.creator_id === user?.id)
    );

    const timeStatus = calculateTimeRemaining();
  
    return (
      <div className="space-y-6">
        
        {/* ENHANCED: Hero Section with Better Visual Hierarchy */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border border-blue-500/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative p-6">
            
            {/* Title Row with Better Spacing */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
                  <div className="flex items-center space-x-2">
                    {isTKR && (
                      <span className="px-2 py-1 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                        TKR
                      </span>
                    )}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${timeStatus.color}`}>
                      {timeStatus.text}
                    </span>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Edit tournament"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-gray-300 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Hosted by {tournament.creator_username || tournament.creator?.username}
                </p>
                {appliedTemplate && (
                  <p className="text-blue-400 text-sm flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    Template: {appliedTemplate}
                  </p>
                )}
              </div>
              
              {/* ENHANCED: Live Countdown for TKR */}
              {isTKR && tournament.status === 'ONGOING' && countdown && (
                <div className="mt-4 lg:mt-0">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 font-semibold">LIVE</span>
                    </div>
                    <div className="text-center text-white">
                      <div className="text-xl font-bold">
                        {countdown.days}d {countdown.hours}h {countdown.minutes}m
                      </div>
                      <div className="text-xs text-gray-300">remaining</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* UPDATED: Quick Stats Grid - Removed Duration */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-green-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Teams</p>
                    <p className="font-semibold text-white">{tournament.current_teams}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <Gamepad2 className="h-6 w-6 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Game</p>
                    <p className="font-semibold text-white text-xs">{tournament.game || 'Warzone'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-6 w-6 text-emerald-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Entry Fee</p>
                    <p className="font-semibold text-white">{tournament.entry_fee || 'Free'}</p>
                  </div>
                </div>
              </div>

              {isTKR && tkrConfig?.consecutive_hours && (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Timer className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Time Window</p>
                      <p className="font-semibold text-white">{tkrConfig.consecutive_hours}h</p>
                    </div>
                  </div>
                </div>
              )}

              {isTKR && tkrConfig?.best_games_count && (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <Target className="h-6 w-6 text-red-400" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Best Games</p>
                      <p className="font-semibold text-white">{tkrConfig.best_games_count}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ENHANCED: Game Information Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold flex items-center mb-4">
            <Gamepad2 className="h-5 w-5 mr-2 text-blue-400" />
            Game Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Gamepad2 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Game</p>
                <p className="font-medium text-white">{tournament.game || 'Call of Duty: Warzone'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Mode</p>
                <p className="font-medium text-white">{tournament.game_mode || 'Battle Royale'}</p>
              </div>
            </div>

            {isTKR && tkrConfig?.map_name && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Map</p>
                  <p className="font-medium text-white">{tkrConfig.map_name}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Team Size</p>
                <p className="font-medium text-white">
                  {isTKR && tkrConfig?.team_size 
                    ? tkrConfig.team_size 
                    : `${tournament.team_size} Players`
                  }
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tournament Schedule */}
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-[#2979FF]" />
              Tournament Schedule
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Start Date & Time:</p>
              <p className="text-white font-medium">
                {new Date(tournament.start_date).toLocaleDateString()} at {formatTime12Hour(tournament.start_time)}
              </p>
            </div>
            {tournament.end_date && (
              <div>
                <p className="text-gray-400">End Date & Time:</p>
                <p className="text-white font-medium">
                  {new Date(tournament.end_date).toLocaleDateString()} at {formatTime12Hour(tournament.end_time)}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* MOVED UP: Tournament Details */}
        <Card className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-400" />
              Tournament Details
            </h2>
            {canEdit && !isEditing && (
              <Button
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Details
              </Button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tournament Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Format</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  >
                    <option value="SINGLE_ELIMINATION">Single Elimination</option>
                    <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                    <option value="TKR">TKR</option>
                  </select>
                </div>
              </div>

              {/* Game and Game Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Game</label>
                  <select
                    value={formData.game}
                    onChange={(e) => setFormData(prev => ({ ...prev, game: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  >
                    {gameOptions.map(game => (
                      <option key={game} value={game}>{game}</option>
                    ))}
                  </select>
                  {formData.game === 'Other' && (
                    <input
                      type="text"
                      value={formData.custom_game}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_game: e.target.value }))}
                      className="w-full px-3 py-2 mt-2 bg-gray-800 rounded"
                      placeholder="Enter custom game name"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Game Mode</label>
                  <select
                    value={formData.game_mode}
                    onChange={(e) => setFormData(prev => ({ ...prev, game_mode: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  >
                    {gameModeOptions.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                  {formData.game_mode === 'Other' && (
                    <input
                      type="text"
                      value={formData.custom_game_mode}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_game_mode: e.target.value }))}
                      className="w-full px-3 py-2 mt-2 bg-gray-800 rounded"
                      placeholder="Enter custom game mode"
                    />
                  )}
                </div>
              </div>

              {/* Entry Fee */}
              <div>
                <label className="block text-sm font-medium mb-1">Team Entry Fee</label>
                <div className="flex space-x-2">
                  <select
                    value={formData.entry_fee}
                    onChange={handleEntryFeeTypeChange}
                    className="w-32 px-3 py-2 bg-gray-800 rounded"
                  >
                    <option value="Free">Free</option>
                    <option value="Paid">Paid</option>
                  </select>
                  {formData.entry_fee === 'Paid' && (
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-2 text-gray-400">$</span>
                      <input
                        type="text"
                        value={formData.entry_fee_amount}
                        onChange={handleEntryFeeAmountChange}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2 bg-gray-800 rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              {formData.entry_fee === 'Paid' && (
                <div className="space-y-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-400">Payment Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Method</label>
                      <select
                        value={formData.payment_method}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 rounded"
                      >
                        <option value="">Select payment method</option>
                        {paymentMethods.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Details (Username/Email/Link)</label>
                      <input
                        type="text"
                        value={formData.payment_details}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment_details: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 rounded"
                        placeholder="e.g., @username, email@example.com, or payment link"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time (EST)</label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                    />
                  </div>
                </div>
              )}

              {/* Team Size and Max Teams */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Team Size</label>
                  <select
                    value={formData.team_size}
                    onChange={(e) => setFormData(prev => ({ ...prev, team_size: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 rounded"
                  >
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players</option>
                  </select>
                </div>

                {formData.format !== 'TKR' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Teams</label>
                    <input
                      type="number"
                      value={formData.max_teams}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_teams: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 rounded"
                      min="4"
                      max="32"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 rounded"
                  placeholder="Describe your tournament..."
                />
              </div>

              {/* Rules */}
              <div>
                <label className="block text-sm font-medium mb-1">Rules</label>
                <textarea
                  value={formData.rules}
                  onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 rounded"
                  placeholder="Tournament rules..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Display sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Format</h3>
                  <p className="font-medium">{formatTournamentFormat(tournament.format)}</p>
                </div>
                
                {/* Only show Team Size for non-TKR tournaments */}
                {tournament.format !== 'TKR' && (
                  <div>
                    <h3 className="text-sm text-gray-400 mb-1">Team Size</h3>
                    <p className="font-medium">{tournament.team_size} Players</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Game</h3>
                  <p className="font-medium">{tournament.game || 'Call of Duty: Warzone'}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Game Mode</h3>
                  <p className="font-medium">{tournament.game_mode || 'Battle Royale'}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Entry Fee</h3>
                  <p className={`font-medium ${tournament.entry_fee && tournament.entry_fee !== 'Free' ? 'text-green-400' : ''}`}>
                    {tournament.entry_fee || 'Free'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Teams</h3>
                  <p className="font-medium">
                    {tournament.format === 'TKR' ? 
                      `${tournament.current_teams} teams` : 
                      `${tournament.current_teams}/${tournament.max_teams}`
                    }
                  </p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Status</h3>
                  <p className="font-medium">{tournament.status}</p>
                </div>
              </div>

              {/* FIXED: Payment Information Display */}
              {tournament.entry_fee && tournament.entry_fee !== 'Free' && (
                // Check for either payment_methods (new format) OR payment_method (legacy format)
                tournament.payment_methods || tournament.payment_method || tournament.payment_details
              ) && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Payment Information
                  </h3>
                  
                  {/* NEW: Multiple Payment Methods Display (JSON format) */}
                  {tournament.payment_methods && (() => {
                    const methods = parsePaymentMethods(tournament.payment_methods);
                    return methods.length > 0 && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {methods.map((method, index) => (
                            <div key={index} className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                              <div className="text-center">
                                <p className="text-sm text-green-400 font-medium">{method.method}</p>
                                <p className="text-white font-semibold mt-1">{method.details}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* LEGACY: Single Payment Method Display (for backwards compatibility) */}
                  {!tournament.payment_methods && tournament.payment_method && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Method:</p>
                        <p className="text-white font-medium">{tournament.payment_method}</p>
                      </div>
                      {tournament.payment_details && (
                        <div>
                          <p className="text-gray-400">Details:</p>
                          <p className="text-white font-medium">{tournament.payment_details}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Details (additional info) */}
                  {tournament.payment_details && tournament.payment_methods && (
                    <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="text-sm text-green-400 mb-1">Additional Details:</p>
                      <p className="text-gray-300 text-sm">{tournament.payment_details}</p>
                    </div>
                  )}
                  
                  {/* Payment Instructions */}
                  {tournament.payment_instructions && (
                    <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="text-sm text-green-400 mb-1">Payment Instructions:</p>
                      <p className="text-gray-300 text-sm">{tournament.payment_instructions}</p>
                    </div>
                  )}

                  {/* Entry Fee Display */}
                  <div className="mt-3 pt-3 border-t border-green-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Tournament Entry Fee:</span>
                      <span className="text-lg font-bold text-green-400">{tournament.entry_fee}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Description Section */}
              {tournament.description && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Description
                  </h3>
                  <Card className="p-4 bg-gray-800/50">
                    <p className="whitespace-pre-wrap text-gray-300">{tournament.description}</p>
                  </Card>
                </div>
              )}

              {/* Rules Section */}
              {tournament.rules && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Rules
                  </h3>
                  <Card className="p-4 bg-gray-800/50">
                    <div className="space-y-2">
                      {tournament.rules.split('\n').map((rule, index) => (
                        rule.trim() && (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{rule.trim()}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* UPDATED: TKR Competition Rules - New Layout */}
        {isTKR && tkrConfig && (
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold flex items-center">
                <Trophy className="h-6 w-6 mr-2 text-yellow-400" />
                TKR Competition Rules
              </h3>
            </div>
            
            {/* NEW: 2-Column Layout - Placement Multipliers & Bonus Points Only */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
              
              {/* LEFT: Placement Multipliers with 3-Column Vertical Layout */}
              <div>
                <h4 className="text-sm font-medium text-white mb-4 flex items-center">
                  <Target className="h-4 w-4 mr-2 text-orange-400" />
                  Placement Multipliers
                </h4>
                {tkrConfig.placement_multipliers && Object.keys(tkrConfig.placement_multipliers).length > 0 ? (
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                    {organizePlacementMultipliers(tkrConfig.placement_multipliers).map((column, columnIndex) => (
                      <div key={columnIndex} className="space-y-1">
                        {column.map(([placement, multiplier]) => (
                          <div key={placement} className="flex justify-between items-center p-2 bg-orange-500/10 border border-orange-500/20 rounded text-sm">
                            <span className="text-orange-400">#{placement}</span>
                            <span className="text-white font-medium">{multiplier}x</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg text-center">
                    <span className="text-gray-400 text-sm">No placement multipliers configured</span>
                  </div>
                )}
              </div>

              {/* RIGHT: Bonus Points with 3-Column Vertical Layout */}
              <div>
                <h4 className="text-sm font-medium text-white mb-4 flex items-center">
                  <Award className="h-4 w-4 mr-2 text-purple-400" />
                  Bonus Points
                </h4>
                {tkrConfig.bonus_point_thresholds && Object.keys(tkrConfig.bonus_point_thresholds).length > 0 ? (
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                    {organizeBonusPoints(tkrConfig.bonus_point_thresholds).map((column, columnIndex) => (
                      <div key={columnIndex} className="space-y-1">
                        {column.map(([kills, bonus]) => (
                          <div key={kills} className="flex justify-between items-center p-2 bg-purple-500/10 border border-purple-500/20 rounded text-sm">
                            <span className="text-purple-400">{kills}+ kills</span>
                            <span className="text-white font-medium">+{bonus}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg text-center">
                    <span className="text-gray-400 text-sm">No bonus points configured</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tournament Features - Kept in same place */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                Tournament Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">{tkrConfig.consecutive_hours}-hour time windows</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">{tkrConfig.best_games_count} best games count</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Live leaderboard tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Automated scoring system</span>
                </div>
                {tkrConfig.allow_reruns && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Rerun sessions (50% discount)</span>
                  </div>
                )}
              </div>
              
              {/* Scoring Formula - Kept in same place */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400 font-medium mb-1">Scoring Formula:</p>
                <p className="text-xs text-gray-400">
                  (Kills × Placement Multiplier) ÷ (Team Rank × 0.1) + Bonus Points = Total Score
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ENHANCED: Prize Pool with Better Design */}
        {isTKR && prizePool && tkrConfig?.show_prize_pool && (
          <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Gift className="h-6 w-6 text-green-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Prize Pool</h3>
                  <p className="text-sm text-gray-400">{prizePool.total_entries} teams registered</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">
                  ${prizePool.final_prize_pool.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">Total pool</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };

export default TournamentDetails;