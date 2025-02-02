// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { FloatingIconsWrapper } from '../components/backgrounds/FloatingIcons';
import { tournamentService } from '../services/tournament';
import heroImage from '../assets/images/hero-2.png';
import HomeTournamentCard from '../components/tournament/HomeTournamentCard';

// Upcoming Tournaments Section
const UpcomingTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await tournamentService.getAllTournaments();
        // Filter for pending tournaments and take the first 4
        const upcomingTournaments = response
          .filter(t => t.status === 'PENDING')
          .slice(0, 4);
        setTournaments(upcomingTournaments);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2979FF]"></div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Upcoming Tournaments</h2>
        <button
          onClick={() => navigate('/tournaments')}
          className="flex items-center text-[#2979FF] hover:text-blue-400 transition-colors"
        >
          View All
          <ChevronRight className="ml-1 h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tournaments.map(tournament => (
          <HomeTournamentCard key={tournament.id} tournament={tournament} />
        ))}
        {tournaments.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-8">
            No upcoming tournaments at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

// Host Card Component
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
      <span>{host.tournaments} Tournaments Hosted</span>
      <span>{host.totalPlayers} Players</span>
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

const HomePage = () => {
  const navigate = useNavigate();

  const sampleHosts = [
    {
      name: "GHML Gaming",
      tournaments: 15,
      totalPlayers: 450,
      description: "Professional tournament organizer specializing in competitive gaming events.",
      twitter: "#",
      discord: "#",
      banner: "/ghml-banner.jpg"
    },
    {
      name: "Elite Gaming",
      tournaments: 12,
      totalPlayers: 360,
      description: "Dedicated to creating the best competitive gaming experience.",
      twitter: "#",
      discord: "#",
      banner: "/elite-banner.jpg"
    },
    // Add more sample hosts as needed
  ];

  return (
    <FloatingIconsWrapper>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="max-w-[1480px] w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              {/* Text Content */}
              <div className="lg:w-[40%] z-10">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
                  Welcome to{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
                    EliteForge
                  </span>
                </h1>
                <p className="text-xl text-gray-300 mt-6 mb-8 leading-relaxed">
                  Join the ultimate tournament platform where champions are made and legends begin.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/host-application')}
                    className="px-6 py-4 bg-[#2979FF] text-white rounded-md font-medium hover:bg-blue-600 transition-all text-"
                  >
                    Become a Host
                  </button>
                  <button
                    onClick={() => navigate('/tournaments')}
                    className="px-6 py-4 bg-white/10 text-white rounded-md font-medium hover:bg-white/20 transition-all flex items-center text-md"
                  >
                    View Tournaments
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Hero Image */}
              <div className="lg:w-[90%]">
                <img 
                  src={heroImage}
                  alt="Elite Tournament Action" 
                  className="w-full h-auto mix-blend-luminosity"
                  style={{ 
                    filter: 'brightness(0.9)',
                    maxHeight: '70vh',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="py-16">
          <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/5 rounded-lg border border-white/10 p-12">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-white mb-8">Why EliteForge?</h2>
                <p className="text-2xl text-gray-300 leading-relaxed">
                  We built EliteForge to revolutionize the tournament experience. Our platform streamlines 
                  tournament organization, making it easier for hosts to create and manage competitions while 
                  providing players with a seamless competitive environment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tournaments */}
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
          <UpcomingTournaments />
        </div>

        {/* Host Section */}
        <div className="py-16">
          <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-8">Our Tournament Hosts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sampleHosts.map((host, index) => (
                <HostCard key={index} host={host} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </FloatingIconsWrapper>
  );
};

export default HomePage;