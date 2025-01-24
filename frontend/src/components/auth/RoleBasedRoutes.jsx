// src/components/auth/RoleBasedRoutes.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';

export const SuperAdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user.role !== UserRole.SUPER_ADMIN) {
    return <Navigate to="/" />;
  }

  return children;
};

export const HostRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user.role !== UserRole.HOST && user.role !== UserRole.SUPER_ADMIN) {
    return <Navigate to="/" />;
  }

  return children;
};

// Helper component for routes that need owner or super admin access
export const OwnerRoute = ({ children, ownerId }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user.role !== UserRole.SUPER_ADMIN && user.id !== ownerId) {
    return <Navigate to="/" />;
  }

  return children;
};