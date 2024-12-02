import { Routes, Route } from 'react-router-dom';
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
      
      {/* Protected Routes */}
      <Route path="/profile" element={<Profile />} />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;