// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

export const ProtectedRoute = ({ children, superuserRequired = false }) => {
  const {isAuthenticated, isSuperuser } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (superuserRequired && !isSuperuser) {
    return <Navigate to="/" replace />;
  }

  return children;
};