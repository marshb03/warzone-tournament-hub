// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Heart, Star, MessageCircle, Link as LinkIcon } from 'lucide-react';
import logo from '../../assets/images/logo.png';

const Footer = () => {
  return (
    <footer className="bg-[#046fcc] text-white relative z-50">
      <div className="max-w-[2400px] mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-3 hover:text-[#2979FF] transition-colors">
              <img 
                src={logo} 
                alt="EliteForge" 
                className="h-24 w-24"  // Adjust size as needed
              />
              <span className="text-2xl font-bold">EliteForge</span>
            </Link>
            <p className="mt-4 text-sm text-gray-300">
              The premier platform for tournament organization and team management.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/tournaments" className="text-gray-300 hover:text-white transition-colors">
                  Tournaments
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

          {/* Contact Section */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300 hover:text-white transition-colors">
                <Mail className="h-5 w-5 mr-2" />
                <a href="mailto:contact@eliteforge.com">contact@eliteforge.com</a>
              </div>
              <div className="flex items-center space-x-4">
                <a 
                  href="https://twitter.com/EliteForge" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-[#1DA1F2] transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
                <a 
                  href="https://discord.gg/eliteforge" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-[#7289DA] transition-colors"
                >
                  <LinkIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Support Us</h3>
            <p className="text-gray-300 mb-4">Help us keep the competitive spirit alive</p>
            <button 
              onClick={() => window.open('YOUR_PAYPAL_LINK_HERE', '_blank')}
              className="flex items-center space-x-2 px-4 py-2 bg-[#2979FF] text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Heart className="h-5 w-5" />
              <span>Donate</span>
            </button>

            <div className="mt-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Star className="h-4 w-4 text-[#2979FF]" />
                <p>Latest Updates</p>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Check our Twitter for the latest tournament updates and announcements.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-center text-sm text-gray-300">
              © {new Date().getFullYear()} EliteForge. All rights reserved.
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