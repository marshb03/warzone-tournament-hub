// src/pages/admin/CreateTournament.jsx - Complete version with fixed payment fields
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import api from '../../services/api';
import config from '../../utils/config';
import cache from '../../utils/cache';

const CreateTournament = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  console.log('Current token:', storage.getSecure('token'));
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    format: 'SINGLE_ELIMINATION',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',  // New field for TKR
    team_size: 2,
    max_teams: 32,
    description: '',
    rules: '',
    // New enhancement fields - Changed default to Paid
    entry_fee: 'Paid',
    entry_fee_amount: '',
    game: 'Call of Duty: Warzone',
    custom_game: '',
    game_mode: 'Battle Royale',
    custom_game_mode: '',
    // Payment fields
    payment_methods: [], // Array of payment methods
    payment_instructions: ''
  });

  // State for adding payment methods
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState({
    method: '',
    details: ''
  });

  // Game options
  const gameOptions = [
    'Call of Duty: Warzone',
    'Battlefield 6',
    'Black Ops 7',
    'Other'
  ];

  // Game mode options
  const gameModeOptions = [
    'Battle Royale',
    'Resurgence',
    'Multiplayer',
    'Other'
  ];

  // Payment method options
  const paymentMethodOptions = [
    'PayPal',
    'Venmo',
    'CashApp',
    'Zelle',
    'Bank Transfer',
    'Other'
  ];

  useEffect(() => {
    const token = storage.getSecure('token');
    console.log('Auth state:', { 
      isAuthenticated, 
      hasToken: !!token,
      user 
    });

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} with value:`, value, 'Current formData:', formData);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEntryFeeTypeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      entry_fee: value,
      entry_fee_amount: value === 'Free' ? '' : prev.entry_fee_amount,
      // Reset payment fields when changing to Free
      payment_methods: value === 'Free' ? [] : prev.payment_methods,
      payment_instructions: value === 'Free' ? '' : prev.payment_instructions
    }));
  };

  const handleEntryFeeAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        entry_fee_amount: value
      }));
    }
  };

  // Payment method functions
  const addPaymentMethod = () => {
    if (currentPaymentMethod.method && currentPaymentMethod.details) {
      setFormData(prev => ({
        ...prev,
        payment_methods: [...prev.payment_methods, currentPaymentMethod]
      }));
      setCurrentPaymentMethod({ method: '', details: '' });
    }
  };

  const removePaymentMethod = (index) => {
    setFormData(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.filter((_, i) => i !== index)
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Add validation
      if (!formData.start_time || !formData.team_size || !formData.start_date) {
        throw new Error('Please fill in all required fields');
      }

      // TKR-specific validation
      if (formData.format === 'TKR') {
        if (!formData.end_date || !formData.end_time) {
          throw new Error('End date and time are required for TKR tournaments');
        }
      } else {
        // Single/Double Elimination validation
        if (!formData.max_teams || formData.max_teams < 4) {
          throw new Error('Single and Double Elimination tournaments require at least 4 teams');
        }
      }

      // Validate custom fields when "Other" is selected
      if (formData.game === 'Other' && !formData.custom_game.trim()) {
        throw new Error('Please specify the custom game name');
      }

      if (formData.game_mode === 'Other' && !formData.custom_game_mode.trim()) {
        throw new Error('Please specify the custom game mode');
      }

      // Validate entry fee amount when not free
      if (formData.entry_fee === 'Paid' && (!formData.entry_fee_amount || parseFloat(formData.entry_fee_amount) <= 0)) {
        throw new Error('Please enter a valid entry fee amount');
      }

      // Validate payment information for paid tournaments
      if (formData.entry_fee === 'Paid') {
        if (formData.payment_methods.length === 0) {
          throw new Error('Please add at least one payment method');
        }
      }
  
      // Prepare dates
      const startDate = new Date(formData.start_date + 'T' + formData.start_time);
      let endDate;
      
      if (formData.format === 'TKR') {
        endDate = new Date(formData.end_date + 'T' + formData.end_time);
      } else {
        endDate = formData.end_date ? 
          new Date(formData.end_date + 'T23:59:59') : 
          new Date(startDate.getTime()); // Use start date if no end date provided
      }
  
      const tournamentData = {
        name: formData.name.trim(),
        format: formData.format,
        start_date: startDate.toISOString(),
        start_time: formData.start_time,
        end_date: endDate.toISOString(),
        end_time: formData.format === 'TKR' ? formData.end_time : undefined,
        team_size: Number(formData.team_size),
        max_teams: formData.format === 'TKR' ? null : Number(formData.max_teams), // No max teams for TKR
        current_teams: 0,
        description: formData.description || '',
        rules: formData.rules || '',
        // New enhancement fields
        entry_fee: getEntryFeeValue(),
        game: getGameValue(),
        game_mode: getGameModeValue(),
        // Payment information - send as JSON string
        payment_methods: formData.entry_fee === 'Paid' ? JSON.stringify(formData.payment_methods) : null,
        payment_instructions: formData.entry_fee === 'Paid' ? formData.payment_instructions : null
      };
  
      console.log('Tournament Data:', tournamentData);
  
      const response = await api.post(config.endpoints.tournaments.create, tournamentData);
      console.log('Tournament created:', response.data);

      // Clear the upcoming tournaments cache since we have a new tournament
      cache.clear('upcoming-tournaments');

      navigate('/tournaments');
    } catch (error) {
      console.error('API Error:', error);
      alert(error.message || 'Error creating tournament');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Create Tournament</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tournament Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Tournament Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              placeholder="Enter tournament name"
            />
          </div>

          {/* Game and Game Mode Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Game</label>
              <select
                name="game"
                value={formData.game}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              >
                {gameOptions.map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
              {formData.game === 'Other' && (
                <input
                  type="text"
                  name="custom_game"
                  value={formData.custom_game}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 mt-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                  placeholder="Enter custom game name"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Game Mode</label>
              <select
                name="game_mode"
                value={formData.game_mode}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              >
                {gameModeOptions.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
              {formData.game_mode === 'Other' && (
                <input
                  type="text"
                  name="custom_game_mode"
                  value={formData.custom_game_mode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 mt-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                  placeholder="Enter custom game mode"
                />
              )}
            </div>
          </div>

          {/* Format and Entry Fee Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tournament Format</label>
              <select
                name="format"
                value={formData.format}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              >
                <option value="SINGLE_ELIMINATION">Single Elimination</option>
                <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                <option value="TKR">TKR (Timed Kill Race)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Team Entry Fee</label>
              <div className="flex space-x-2">
                <select
                  value={formData.entry_fee}
                  onChange={handleEntryFeeTypeChange}
                  className="w-32 px-3 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
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
                      required
                      className="w-full pl-8 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information Section - Multiple Methods */}
          {formData.entry_fee === 'Paid' && (
            <div className="space-y-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="text-lg font-medium text-blue-400">Payment Information</h3>
              <p className="text-sm text-gray-400">
                Add multiple payment methods for teams to choose from when registering.
              </p>
              
              {/* Add New Payment Method */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-white">Add Payment Method</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Method</label>
                    <select
                      value={currentPaymentMethod.method}
                      onChange={(e) => setCurrentPaymentMethod(prev => ({ ...prev, method: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                    >
                      <option value="">Select method</option>
                      {paymentMethodOptions.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Details</label>
                    <input
                      type="text"
                      value={currentPaymentMethod.details}
                      onChange={(e) => setCurrentPaymentMethod(prev => ({ ...prev, details: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                      placeholder="@username, email, or payment link"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addPaymentMethod}
                      disabled={!currentPaymentMethod.method || !currentPaymentMethod.details}
                      className="w-full"
                    >
                      Add Method
                    </Button>
                  </div>
                </div>
              </div>

              {/* Display Added Payment Methods */}
              {formData.payment_methods.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-md font-medium text-white">Payment Methods ({formData.payment_methods.length})</h4>
                  {formData.payment_methods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div>
                        <span className="font-medium text-white">{method.method}:</span>
                        <span className="text-gray-300 ml-2">{method.details}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removePaymentMethod(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Payment Instructions (Optional)</label>
                <textarea
                  name="payment_instructions"
                  value={formData.payment_instructions}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                  placeholder="Additional instructions for teams (e.g., 'Include team name in payment note', 'Payment due within 24 hours of registration')"
                />
              </div>
            </div>
          )}

          {/* Dates and Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Start Time (EST)</label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              />
            </div>
          </div>

          {/* TKR End Date and Time - Only show for TKR format */}
          {formData.format === 'TKR' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Time (EST)</label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                />
              </div>
            </div>
          )}

          {/* Team Size and Max Teams - Hide Max Teams for TKR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Team Size</label>
              <select
                name="team_size"
                value={formData.team_size}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              >
                <option value={2}>2 Players</option>
                <option value={3}>3 Players</option>
                <option value={4}>4 Players</option>
              </select>
            </div>

            {/* Only show Max Teams for Single/Double Elimination */}
            {formData.format !== 'TKR' && (
              <div>
                <label className="block text-sm font-medium mb-1">Max Teams</label>
                <input
                  type="number"
                  name="max_teams"
                  value={formData.max_teams}
                  onChange={handleChange}
                  required
                  min="4"
                  max="32"
                  className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                />
              </div>
            )}
          </div>

          {/* Description and Rules */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                placeholder="Describe your tournament..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rules</label>
              <textarea
                name="rules"
                value={formData.rules}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                placeholder="Tournament rules..."
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/tournaments')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Tournament'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateTournament;