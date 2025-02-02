import React, { useEffect, useState } from 'react';
import { Trophy, Star } from 'lucide-react';

const VictoryModal = ({ winner, onClose }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setShowContent(true), 100);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      {/* Enhanced Stars/Fireworks Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-[ping_1.5s_ease-in-out_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${1 + Math.random() * 3}s`,
              animationDelay: `${Math.random() * 2}s`,
              transform: `scale(${0.5 + Math.random()})`,
            }}
          >
            <Star 
              className="h-3 w-3 text-yellow-400" 
              style={{
                filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.8))'
              }}
            />
          </div>
        ))}
        {[...Array(20)].map((_, i) => (
          <div
            key={`glow-${i}`}
            className="absolute animate-[ping_2s_ease-out_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <div 
              className="h-4 w-4 rounded-full bg-yellow-500/80"
              style={{
                filter: 'blur(4px)'
              }}
            />
          </div>
        ))}
      </div>

      {/* Modal Content */}
      <div 
        className={`transform transition-all duration-500 ease-out ${
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl p-12 max-w-2xl w-full border border-yellow-500/20 shadow-xl">
          {/* Top Section */}
          <div className="relative mb-8">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-yellow-500/30 blur-2xl rounded-full" />
            
            {/* Trophy Icon */}
            <div className="relative flex justify-center">
              <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 p-8 rounded-full shadow-lg">
                <Trophy className="h-20 w-20 text-white animate-bounce" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-10">
            {/* Title with gradient */}
            <h2 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent pb-2">
                Congratulations!
            </h2>
            
            {/* Champion Section */}
            <div className="py-8 px-8 rounded-md bg-gray-800/50 border border-gray-700 shadow-inner">
              <p className="text-2xl text-blue-400 font-medium">
                Tournament Champion
              </p>
              <p className="text-4xl font-bold text-white mt-4 break-words">
                {winner}
              </p>
            </div>
            
            {/* Button */}
            <button
              onClick={onClose}
              className="mt-8 px-12 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xl font-medium rounded-lg 
                       hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-1 transition-all duration-200
                       shadow-lg hover:shadow-blue-500/25"
            >
              View Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictoryModal;