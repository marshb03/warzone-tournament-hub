// src/components/layout/Header.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, X, ChevronDown, User } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext'; // Assuming this is your auth context path

const Header = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Assuming these are available in your AuthContext

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
    <header className="bg-[#1A237E] text-white shadow-lg">
      <nav className="max-w-[2400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold hover:text-[#2979FF] transition-colors">
                WZ Tournament
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Button 
                variant="ghost"
                className={isActivePath('/tournaments') ? 'bg-white/10' : ''}
                onClick={() => navigate('/tournaments')}
              >
                Tournaments
              </Button>
              <Button 
                variant="ghost"
                className={isActivePath('/team-generator') ? 'bg-white/10' : ''}
                onClick={() => navigate('/team-generator')}
              >
                Team Generator
              </Button>
              <Button 
                variant="ghost"
                className={isActivePath('/rankings') ? 'bg-white/10' : ''}
                onClick={() => navigate('/rankings')}
              >
                Rankings
              </Button>
              <Button 
                variant="ghost"
                className={isActivePath('/results') ? 'bg-white/10' : ''}
                onClick={() => navigate('/results')}
              >
                Results
              </Button>
            </div>
          </div>

          {/* User navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/notifications')}
                  className={isActivePath('/notifications') ? 'bg-white/10' : ''}
                >
                  <Bell className="h-5 w-5" />
                </Button>
                
                <div className="relative">
                  <div>
                    <Button 
                      variant="ghost"
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2"
                    >
                      <User className="h-5 w-5" />
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#121212] ring-1 ring-black ring-opacity-5">
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
              </>
            ) : (
              <>
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Button 
              variant="ghost" 
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Button 
                variant="ghost" 
                className="w-full text-left"
                onClick={() => {
                  navigate('/tournaments');
                  setIsOpen(false);
                }}
              >
                Tournaments
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-left"
                onClick={() => {
                  navigate('/team-generator');
                  setIsOpen(false);
                }}
              >
                Team Generator
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-left"
                onClick={() => {
                  navigate('/rankings');
                  setIsOpen(false);
                }}
              >
                Rankings
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-left"
                onClick={() => {
                  navigate('/results');
                  setIsOpen(false);
                }}
              >
                Results
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;