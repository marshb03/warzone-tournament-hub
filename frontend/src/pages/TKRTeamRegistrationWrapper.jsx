// src/pages/TKRTeamRegistrationWrapper.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import TKRTeamRegistrationForm from '../components/tkr/TKRTeamRegistrationForm';
import PageBackground from '../components/backgrounds/PageBackground';

const TKRTeamRegistrationWrapper = () => {
  const { tournamentId } = useParams();
  
  // Convert to number and validate
  const tournamentIdNum = parseInt(tournamentId);
  
  if (isNaN(tournamentIdNum)) {
    return (
      <PageBackground>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Invalid Tournament</h1>
            <p className="text-gray-400">The tournament ID provided is not valid.</p>
          </div>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <TKRTeamRegistrationForm
        tournamentId={tournamentIdNum}
        onRegistrationComplete={(registration) => {
          console.log('Registration completed:', registration);
          // Could redirect to tournament page or show success message
        }}
        onCancel={() => {
          window.history.back();
        }}
      />
    </PageBackground>
  );
};

export default TKRTeamRegistrationWrapper;