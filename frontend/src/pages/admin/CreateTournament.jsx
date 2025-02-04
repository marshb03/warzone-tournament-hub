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
    start_time: '',  // Changed from startTime to start_time
    end_date: '',
    team_size: 2,    // Changed from teamSize to team_size
    max_teams: 32,   // Changed from maxTeams to max_teams
    description: '',
    rules: '',
  });

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
  }, [isAuthenticated, navigate, user]); // Added user to dependency array

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} with value:`, value, 'Current formData:', formData);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Add validation
      if (!formData.start_time || !formData.team_size || !formData.max_teams || !formData.start_date) {
        throw new Error('Please fill in all required fields');
      }
  
      // Ensure end_date is never empty
      const startDate = new Date(formData.start_date + 'T' + formData.start_time);
      const endDate = formData.end_date ? 
        new Date(formData.end_date + 'T23:59:59') : 
        new Date(startDate.getTime()); // Use start date if no end date provided
  
      const tournamentData = {
        name: formData.name.trim(),
        format: formData.format,
        start_date: startDate.toISOString(),
        start_time: formData.start_time,
        end_date: endDate.toISOString(),
        team_size: Number(formData.team_size),
        max_teams: Number(formData.max_teams),
        current_teams: 0,
        description: formData.description || '',
        rules: formData.rules || ''
      };
  
      console.log('Full API URL:', config.apiUrl + config.endpoints.tournaments.create);
      console.log('Request Headers:', {
        Authorization: `Bearer ${storage.getSecure('token')}`,
        'Content-Type': 'application/json'
      });
      console.log('Tournament Data:', tournamentData);
  
      const response = await api.post(config.endpoints.tournaments.create, tournamentData);
      console.log('Tournament created:', response.data);

      // Clear the upcoming tournaments cache since we have a new tournament
      cache.clear('upcoming-tournaments');

      navigate('/tournaments');
    } catch (error) {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
        url: error.config?.url,
        headers: error.config?.headers
      });
      alert(error.message || 'Error creating tournament');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
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

          {/* Format Selection */}
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
            </select>
          </div>

          {/* Dates */}
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

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
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

          {/* Team Size */}
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

            {/* Max Teams */}
            <div>
              <label className="block text-sm font-medium mb-1">Max Teams</label>
              <input
                type="number"
                name="max_teams"
                value={formData.max_teams}
                onChange={handleChange}
                required
                min="2"
                className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
              />
            </div>
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