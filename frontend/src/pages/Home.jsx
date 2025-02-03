// src/pages/Home.jsx
import React from 'react';
import { FloatingIconsWrapper } from '../components/backgrounds/FloatingIcons';
import Hero from '../components/home/Hero';
import TournamentHostSection from '../components/home/TournamentHostSection';
import { UpcomingTournaments } from '../components/home/UpcomingTournaments';

const HomePage = () => {
  return (
    <FloatingIconsWrapper>
      <div className="min-h-screen">
        {/* Hero Section */}
        <Hero />

        {/* Why GHML Section */}
        <div className="py-16">
          <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/5 rounded-lg border border-white/10 p-12">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-white mb-8">Why GHML Gaming?</h2>
                <p className="text-2xl text-gray-300 leading-relaxed">
                  We built GHML Gaming to revolutionize the tournament experience. Our platform streamlines 
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

        {/* Tournament Host Section */}
          <div className="max-w-[1480px] mx-auto">
            <TournamentHostSection />
        </div>
      </div>
    </FloatingIconsWrapper>
  );
};

export default HomePage;