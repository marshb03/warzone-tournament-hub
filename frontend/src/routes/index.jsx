// src/routes/index.jsx
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { SuperAdminRoute, HostRoute } from '../components/auth/RoleBasedRoutes';
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
import EmailVerification from '../pages/auth/EmailVerification';
import HostApplication from '../pages/HostApplication';

// Admin/Superuser pages
import TournamentManagement from '../pages/admin/TournamentManagement';
import UserManagement from '../pages/admin/UserManagement';
import AdminDashboard from '../pages/admin/AdminDashboard';
import CreateTournament from '../pages/admin/CreateTournament';
import HostApplications from '../pages/admin/HostApplication';

//Host pages
import HostDashboard from '../pages/host/HostDashboard';
import HostTournaments from '../pages/host/HostTournaments';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
      <Route path="/verify-email/:token" element={<EmailVerification />} />
      <Route path="/host-application" element={<HostApplication />} />
      <Route path="/team-generator" element={<TeamGenerator />} />
      
      {/* View-only Routes (no auth required) */}
      <Route path="/tournaments" element={<Tournaments />} />
      <Route path="/tournaments/:id" element={<TournamentDetail />} />
      <Route path="/results" element={<Results />} />
      <Route path="/rankings" element={<PlayerRankings />} />

      {/* Protected Routes (require login) */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Host & Super Admin Routes */}
      <Route path="/tournaments/new" element={
        <HostRoute>
          <CreateTournament />
        </HostRoute>
      } />
      
      {/* Super Admin Only Routes */}
      <Route path="/admin" element={
        <SuperAdminRoute>
          <AdminDashboard />
        </SuperAdminRoute>
      } />
      <Route path="/admin/users" element={
        <SuperAdminRoute>
          <UserManagement />
        </SuperAdminRoute>
      } />
      <Route path="/admin/tournaments" element={
        <SuperAdminRoute>
          <TournamentManagement />
        </SuperAdminRoute>
      } />
      <Route path="/admin/host-applications" element={
        <SuperAdminRoute>
          <HostApplications />
        </SuperAdminRoute>
      } />

      {/* Host Only Routes */}
      <Route path="/host" element={
        <HostRoute>
          <HostDashboard />
        </HostRoute>
      } />
      <Route path="/host/tournaments" element={
        <HostRoute>
          <HostTournaments />
        </HostRoute>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;