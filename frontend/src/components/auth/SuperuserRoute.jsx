// src/components/auth/SuperuserRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SuperuserRoute = ({ children }) => {
  const { user, isSuperuser } = useAuth();

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  if (!isSuperuser) {
    // Logged in but not superuser, redirect to home
    return <Navigate to="/" />;
  }

  // Superuser, render the protected content
  return children;
};

export default SuperuserRoute;