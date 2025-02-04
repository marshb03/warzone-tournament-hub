// src/components/hero/Hero.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '../../assets/images/hero-2.png';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/1 to-transparent z-0" />
      
      <div className="max-w-[1480px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Text Content */}
          <motion.div 
            className="lg:w-[45%]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl sm:text-7xl font-bold text-white leading-tight">
              Welcome to{' '}
              <span className="relative whitespace-nowrap">
                <span className="bg-gradient-to-r from-[#2979FF] via-blue-400 to-[#2979FF] text-transparent bg-clip-text">
                  BSRP Gaming
                </span>
                {/* Accent line under GHML Gaming */}
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#2979FF] via-blue-400 to-[#2979FF] rounded-full" />
              </span>
            </h1>
            
            <motion.p 
              className="text-xl text-gray-300 mt-8 mb-10 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Join the ultimate tournament platform where champions are made and legends begin.
            </motion.p>

            <motion.div 
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <button
                onClick={() => navigate('/host-application')}
                className="group px-6 py-3 bg-[#2979FF] text-white rounded-md font-medium hover:bg-blue-600 transition-all"
              >
                <span className="text-lg">
                  Become a Host
                </span>
                <div className="h-0.5 w-0 group-hover:w-full bg-white/30 transition-all duration-300" />
              </button>

              <button
                onClick={() => navigate('/tournaments')}
                className="group px-6 py-3 bg-white/10 text-white rounded-md font-medium hover:bg-white/20 transition-all flex items-center text-lg"
              >
                <span>
                  View Tournaments
                </span>
                <ChevronRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div 
            className="lg:w-[55%] relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <img 
              src={heroImage}
              alt="Elite Tournament Action" 
              className="w-full h-auto relative z-10"
              style={{ 
                filter: 'brightness(0.9)',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
            
            {/* Accent elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </div>

      {/* Floating accent elements */}
      <div className="absolute top-1/4 left-10 w-2 h-2 bg-blue-400/30 rounded-full" />
      <div className="absolute bottom-1/3 right-20 w-3 h-3 bg-blue-400/20 rounded-full" />
      <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400/30 rounded-full" />
    </div>
  );
};

export default Hero;