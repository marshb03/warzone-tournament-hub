// src/pages/HostApplication.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const HostApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    experience: '',
    availability: '',
    previous_experience: '',
    additional_info: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/v1/host-applications', formData);
      navigate('/profile', { 
        state: { 
          message: 'Your host application has been submitted successfully! We will review it shortly.'
        }
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-white mb-6">Become a Tournament Host</h1>
        <p className="text-gray-300 mb-8">Please log in to submit a host application.</p>
        <button
          onClick={() => navigate('/login', { state: { from: '/host-application' } })}
          className="px-6 py-3 bg-[#2979FF] text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Log In to Continue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-6">Become a Tournament Host</h1>
      <p className="text-gray-300 mb-8">
        Fill out the form below to apply as a tournament host. We&apos;ll review your application
        and get back to you shortly.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="experience" className="block text-gray-200 mb-2">
            Gaming Experience
          </label>
          <textarea
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            required
            placeholder="Tell us about your gaming experience, including the games you play and your skill level..."
            className="w-full px-4 py-3 rounded-md bg-white/5 border border-white/10 text-white placeholder-gray-500
                     focus:border-[#2979FF] focus:ring-1 focus:ring-[#2979FF] transition-colors"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="availability" className="block text-gray-200 mb-2">
            Availability & Commitment
          </label>
          <textarea
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            required
            placeholder="What is your weekly availability? How many tournaments can you host per week?"
            className="w-full px-4 py-3 rounded-md bg-white/5 border border-white/10 text-white placeholder-gray-500
                     focus:border-[#2979FF] focus:ring-1 focus:ring-[#2979FF] transition-colors"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="previous_experience" className="block text-gray-200 mb-2">
            Previous Tournament Experience
          </label>
          <textarea
            id="previous_experience"
            name="previous_experience"
            value={formData.previous_experience}
            onChange={handleChange}
            required
            placeholder="Have you organized tournaments before? Tell us about your experience..."
            className="w-full px-4 py-3 rounded-md bg-white/5 border border-white/10 text-white placeholder-gray-500
                     focus:border-[#2979FF] focus:ring-1 focus:ring-[#2979FF] transition-colors"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="additional_info" className="block text-gray-200 mb-2">
            Additional Information (Optional)
          </label>
          <textarea
            id="additional_info"
            name="additional_info"
            value={formData.additional_info}
            onChange={handleChange}
            placeholder="Anything else you'd like us to know about you?"
            className="w-full px-4 py-3 rounded-md bg-white/5 border border-white/10 text-white placeholder-gray-500
                     focus:border-[#2979FF] focus:ring-1 focus:ring-[#2979FF] transition-colors"
            rows={3}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-3 rounded-md font-medium text-white transition-colors
              ${loading ? 'bg-blue-600 cursor-not-allowed' : 'bg-[#2979FF] hover:bg-blue-600'}`}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HostApplication;