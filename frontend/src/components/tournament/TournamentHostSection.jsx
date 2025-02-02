// TournamentHostSection.jsx template
import React, { useState, useEffect } from 'react';
import { MessageCircle, Link as LinkIcon } from 'lucide-react';
import api from '../../services/api';

const HostCard = ({ host }) => (
  <div className="bg-white/5 rounded-lg p-6 border border-white/10 hover:border-white/20 transition-colors">
    <div className="h-32 bg-gray-800/50 rounded-lg mb-4 overflow-hidden">
      <img 
        src={host.banner || "/api/placeholder/400/320"}
        alt={`${host.name} banner`}
        className="w-full h-full object-cover"
      />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{host.name}</h3>
    <div className="flex justify-between mb-4 text-sm text-gray-400">
      <span>{host.tournaments_count} Tournaments Hosted</span>
      <span>{host.total_players} Players</span>
    </div>
    <p className="text-gray-300 text-sm mb-4">{host.description}</p>
    <div className="flex gap-3">
      {host.twitter && (
        <a 
          href={host.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-400 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      )}
      {host.discord && (
        <a 
          href={host.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-[#7289DA] transition-colors"
        >
          <LinkIcon className="h-5 w-5" />
        </a>
      )}
    </div>
  </div>
);

const TournamentHostSection = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        // Endpoint to fetch host data with tournament stats
        const response = await api.get('/api/v1/users/hosts');
        setHosts(response.data);
      } catch (error) {
        console.error('Failed to fetch hosts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHosts();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="py-16">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-8">Our Tournament Hosts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hosts.map((host, index) => (
            <HostCard key={host.id || index} host={host} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentHostSection;