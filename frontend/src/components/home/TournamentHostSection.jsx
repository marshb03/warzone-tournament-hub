// src/components/home/TournamentHostSection.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

// Custom Discord icon component
const DiscordIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// Custom Twitter/X icon component
const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const generateDefaultAvatar = (name) => {
  const letter = name ? name.charAt(0).toUpperCase() : 'U';
  const svg = `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#2979FF"/>
      <text x="32" y="42" font-family="Arial, sans-serif" font-size="28" fill="white" text-anchor="middle">${letter}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const HostCard = ({ host }) => {
  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-800/50 ring-2 ring-[#2979FF]">
            <img 
              src={host.logo_url || generateDefaultAvatar(host.name)}
              alt={`${host.name}'s profile`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{host.name}</h3>
          <div className="flex gap-2 mt-1">
            {host.twitter_url && (
              <a 
                href={host.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#1DA1F2] transition-colors"
                title="Twitter/X"
              >
                <TwitterIcon className="h-5 w-5" />
              </a>
            )}
            {host.discord_url && (
              <a 
                href={host.discord_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#5865F2] transition-colors"
                title="Discord"
              >
                <DiscordIcon className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mb-4 text-sm text-white border-t border-white/10 pt-4">
        <span>
          {host.tournaments_count} Tournament{host.tournaments_count !== 1 ? 's' : ''} Hosted
        </span>
        <span>
          {host.total_teams} Total Team{host.total_teams !== 1 ? 's' : ''} 
        </span>
      </div>

      {host.description && (
        <p className="text-gray-300 text-sm">{host.description}</p>
      )}
    </div>
  );
};

const TournamentHostSection = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/v1/hosts/active');
        
        // Show all active hosts, regardless of tournament count
        setHosts(response.data);
      } catch (error) {
        console.error('Failed to fetch hosts:', error);
        setError('Unable to load tournament hosts at this time.');
      } finally {
        setLoading(false);
      }
    };

    fetchHosts();
    
    // Refresh hosts data every 5 minutes to get updates
    const interval = setInterval(fetchHosts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2979FF]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (hosts.length === 0) {
    return (
      <div className="py-16">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-8">Tournament Hosts</h2>
          <div className="text-center text-gray-400">
            <p>No active tournament hosts at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-8">Tournament Hosts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hosts.map((host) => (
            <HostCard key={host.id} host={host} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentHostSection;