// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import logo from '../../assets/images/logo.png';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-[#1A237E] text-white relative z-50">
      <nav className="max-w-[2400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          {/* Logo and primary navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center mr-12">
              <Link to="/" className="flex items-center space-x-2">
                {/* Logo placeholder - replace src with your logo */}
                <img
                  src={logo}
                  alt="EliteForge"
                  className="h-56 w-56"
                />       
              </Link>
            </div>
            <div className="hidden sm:flex sm:space-x-8">
              <Link 
                to="/tournaments"
                className={`text-xl font-medium px-3 py-2 rounded-lg transition-colors ${
                  isActivePath('/tournaments') 
                    ? 'bg-white/10 text-white' 
                    : 'text-white hover:text-white hover:bg-white/5'
                }`}
              >
                Tournaments
              </Link>
              <Link 
                to="/team-generator"
                className={`text-xl font-medium px-3 py-2 rounded-lg transition-colors ${
                  isActivePath('/team-generator') 
                    ? 'bg-white/10 text-white' 
                    : 'text-white hover:text-white hover:bg-white/5'
                }`}
              >
                Team Generator
              </Link>
              <Link 
                to="/rankings"
                className={`text-xl font-medium px-3 py-2 rounded-lg transition-colors ${
                  isActivePath('/rankings') 
                    ? 'bg-white/10 text-white' 
                    : 'text-white hover:text-white hover:bg-white/5'
                }`}
              >
                Rankings
              </Link>
              <Link 
                to="/results"
                className={`text-xl font-medium px-3 py-2 rounded-lg transition-colors ${
                  isActivePath('/results') 
                    ? 'bg-white/10 text-white' 
                    : 'text-white hover:text-white hover:bg-white/5'
                }`}
              >
                Results
              </Link>
            </div>
          </div>

          {/* User navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="text-lg">{user.username}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-[#121212] ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link 
                        to="/profile"
                        className="block px-4 py-2 text-sm text-white hover:bg-[#2979FF]/10"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Your Profile
                      </Link>
                      {user.is_superuser && (
                        <Link 
                          to="/admin"
                          className="block px-4 py-2 text-sm text-white hover:bg-[#2979FF]/10"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#2979FF]/10"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="text-lg"
                >
                  Login
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/register')}
                  className="text-lg"
                >
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/5 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="sm:hidden py-4">
            <div className="space-y-2">
              <Link
                to="/tournaments"
                className="block px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/5"
                onClick={() => setIsOpen(false)}
              >
                Tournaments
              </Link>
              <Link
                to="/rankings"
                className="block px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/5"
                onClick={() => setIsOpen(false)}
              >
                Rankings
              </Link>
              <Link
                to="/results"
                className="block px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/5"
                onClick={() => setIsOpen(false)}
              >
                Results
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;