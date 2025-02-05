import React from 'react';
import { Rocket } from 'lucide-react';
import PageBackground from '../components/backgrounds/PageBackground';

const ComingSoon = () => {
  return (
    <PageBackground>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Rocket className="h-16 w-16 text-[#2979FF] animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Coming Soon!</h1>
          <p className="text-xl text-gray-200 mb-8">
            Still deciding if it is worth the headache.
          </p>
          <p className="text-gray-400">
            Stay tuned for updates and check back soon!
          </p>
        </div>
      </div>
    </PageBackground>
  );
};

export default ComingSoon;