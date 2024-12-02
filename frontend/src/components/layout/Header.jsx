import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900';
  };

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Warzone Tournament Hub
          </Link>
          
          <div className="flex space-x-6">
            <Link to="/tournaments" className={`${isActive('/tournaments')} font-medium`}>
              Tournaments
            </Link>
            <Link to="/team-generator" className={`${isActive('/team-generator')} font-medium`}>
              Team Generator
            </Link>
            <Link to="/rankings" className={`${isActive('/rankings')} font-medium`}>
              Rankings
            </Link>
            <Link to="/results" className={`${isActive('/results')} font-medium`}>
              Results
            </Link>
            <Link to="/profile" className={`${isActive('/profile')} font-medium`}>
              Profile
            </Link>
            <Link to="/login" className={`${isActive('/login')} font-medium`}>
              Login
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;