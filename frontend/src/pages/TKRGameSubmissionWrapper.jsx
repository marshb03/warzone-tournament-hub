// src/pages/TKRGameSubmissionWrapper.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import TKRGameSubmissionForm from '../components/tkr/TKRGameSubmissionForm';
import PageBackground from '../components/backgrounds/PageBackground';

const TKRGameSubmissionWrapper = () => {
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
      <TKRGameSubmissionForm
        tournamentId={tournamentIdNum}
        teamRegistrationId={1} // This should come from team selection or user context
        onSubmissionComplete={() => {
          console.log('Submission completed');
          // Could redirect to tournament page or show success message
        }}
      />
    </PageBackground>
  );
};

export default TKRGameSubmissionWrapper;