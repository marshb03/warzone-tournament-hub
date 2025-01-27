// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#1A237E] text-white">
      <div className="max-w-[2400px] mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-bold hover:text-[#2979FF] transition-colors">
              WZ Tournament
            </Link>
            <p className="mt-2 text-sm text-gray-300">
              The premier platform for Warzone tournament organization and team management.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/tournaments" className="text-gray-300 hover:text-white transition-colors">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link to="/team-generator" className="text-gray-300 hover:text-white transition-colors">
                  Team Generator
                </Link>
              </li>
              <li>
                <Link to="/rankings" className="text-gray-300 hover:text-white transition-colors">
                  Rankings
                </Link>
              </li>
              <li>
                <Link to="/results" className="text-gray-300 hover:text-white transition-colors">
                  Results
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Connect</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-center text-sm text-gray-300">
              © {new Date().getFullYear()} WZ Tournament. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link to="/privacy" className="text-sm text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-300 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;