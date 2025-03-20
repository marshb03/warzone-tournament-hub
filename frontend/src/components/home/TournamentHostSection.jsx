import React, { useState, useEffect } from 'react';
import { Twitter, Link as LinkIcon } from 'lucide-react';
import api from '../../services/api';
import cache from '../../utils/cache';

// Import host logos
import host1Logo from '../../assets/images/host1-logo.png';
import host2Logo from '../../assets/images/host2-logo.png';
//import host3Logo from '../../assets/images/host3-logo.jpg';

// Static host configuration - based on usernames
const HOSTS_CONFIG = {
  'BSRP Gaming': {  // Admin host
    logo: host1Logo,
    description: "Administrator and lead tournament organizer for EliteForge.",
    twitter: "https://twitter.com/ghmlgaming",
    discord: "https://discord.gg/WEkdnbeCJh"
  },
  'Brett': {  // Brett's configuration
    logo: host2Logo,
    description: "Tournament organizer and community manager.",
    twitter: "https://twitter.com/brett",
    discord: "https://discord.gg/brett"
  }
};

const HostCard = ({ host }) => {
  const hostConfig = HOSTS_CONFIG[host.name] || {};

  return (
    <div className="bg-white/5 rounded-lg p-6 border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-800/50 ring-2 ring-[#2979FF]">
            <img 
              src={hostConfig.logo}
              alt={`${host.name}'s profile`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{host.name}</h3>
          <div className="flex gap-2 mt-1">
            {hostConfig.twitter && (
              <a 
                href={hostConfig.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#1DA1F2] transition-colors"
                title="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {hostConfig.discord && (
              <a 
                href={hostConfig.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#5865F2] transition-colors"
                title="Discord"
              >
                <LinkIcon className="h-5 w-5" />
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

      {hostConfig.description && (
        <p className="text-gray-300 text-sm">{hostConfig.description}</p>
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
        // Check cache first
        const cachedHosts = cache.get('tournament-hosts');
        if (cachedHosts) {
          setHosts(cachedHosts);
          setLoading(false);
          return;
        }

        // If no cache, fetch from API
        const response = await api.get('/api/v1/hosts/active');
        setHosts(response.data);
        
        // Cache the response for 12 hours
        cache.set('tournament-hosts', response.data, 12);
      } catch (error) {
        console.error('Failed to fetch hosts:', error);
        setError('Unable to load tournament hosts at this time.');
      } finally {
        setLoading(false);
      }
    };

    fetchHosts();
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

  // Filter out hosts that don't have a configuration
  const configuredHosts = hosts.filter(host => HOSTS_CONFIG[host.name]);

  return (
    <div className="py-16">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-8">Tournament Hosts</h2>
        {configuredHosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {configuredHosts.map((host) => (
              <HostCard key={host.id} host={host} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <p>No tournament hosts available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentHostSection;