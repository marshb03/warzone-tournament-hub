// src/routes/index.jsx
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import SuperuserRoute from '../components/auth/SuperuserRoute';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

// Pages
import Home from '../pages/Home';
import Tournaments from '../pages/Tournaments';
import TournamentDetail from '../pages/TournamentDetail';
import Results from '../pages/Results';
import TeamGenerator from '../pages/TeamGenerator';
import PlayerRankings from '../pages/PlayerRankings';
import Profile from '../pages/Profile';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import NotFound from '../pages/NotFound';

// Admin/Superuser pages (you'll need to create these)
import TournamentManagement from '../pages/admin/TournamentManagement';
import UserManagement from '../pages/admin/UserManagement';
import AdminDashboard from '../pages/admin/AdminDashboard';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/tournaments" element={<Tournaments />} />
      <Route path="/tournaments/:id" element={<TournamentDetail />} />
      <Route path="/results" element={<Results />} />
      <Route path="/team-generator" element={<TeamGenerator />} />
      <Route path="/rankings" element={<PlayerRankings />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      <Route path="/reset-password/:token" element={<ResetPasswordForm />} />

      {/* Protected Routes (require login) */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Superuser/Admin Routes */}
      <Route path="/admin" element={
        <SuperuserRoute>
          <AdminDashboard />
        </SuperuserRoute>
      } />
      <Route path="/admin/tournaments" element={
        <SuperuserRoute>
          <TournamentManagement />
        </SuperuserRoute>
      } />
      <Route path="/admin/users" element={
        <SuperuserRoute>
          <UserManagement />
        </SuperuserRoute>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;