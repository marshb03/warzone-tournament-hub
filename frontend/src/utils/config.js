// src/utils/config.js - Updated to include TKR endpoints
const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  jwtSecret: process.env.REACT_APP_JWT_SECRET,
  tokenExpiry: Number(process.env.REACT_APP_TOKEN_EXPIRY || '30'),
  encryptionKey: process.env.REACT_APP_ENCRYPTION_KEY || 'default-key-replace-in-production',
  
  // Environment checks
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // API endpoints
  endpoints: {
      auth: {
          login: '/api/v1/login/access-token',
          register: '/api/v1/users/users',
          testToken: '/api/v1/test-token',
          passwordReset: '/api/v1/password-reset',
          passwordResetConfirm: '/api/v1/password-reset-confirm',
      },
      admin:{
        stats: '/api/v1/admin/stats',
        users: '/api/v1/admin/users',
        tournaments: '/api/v1/admin/tournaments'
      },
      tournaments: {
          list: '/api/v1/tournaments/',
          create: '/api/v1/tournaments/',
          details: (id) => `/api/v1/tournaments/${id}`,
          update: (id) => `/api/v1/tournaments/${id}`,
          delete: (id) => `/api/v1/tournaments/${id}`,
          brackets: (id) => `/api/v1/tournaments/${id}/brackets`,
          matches: (id) => `/api/v1/tournaments/${id}/matches`,
      },
      users: {
          profile: '/api/v1/users/me',
          update: '/api/v1/users/me',
          list: '/api/v1/users',
          details: (id) => `/api/v1/users/${id}`,
      },
      teams: {
          list: '/api/v1/teams',
          create: '/api/v1/teams',
          details: (id) => `/api/v1/teams/${id}`,
          update: (id) => `/api/v1/teams/${id}`,
          delete: (id) => `/api/v1/teams/${id}`,
      },
      matches: {
        base: '/api/v1/matches',
        winners: (id) => `/api/v1/matches/winners/${id}`,
        losers: (id) => `/api/v1/matches/losers/${id}`,
        championship: (id) => `/api/v1/matches/championship/${id}`,
        tournament: (id) => `/api/v1/matches/tournament/${id}`,
        losersBracket: (id) => `/api/v1/losers-matches/tournament/${id}`,
      },
      // TKR endpoints
      tkr: {
        // Tournament configuration
        createConfig: (tournamentId) => `/api/v1/tkr/tournaments/${tournamentId}/config`,
        getConfig: (tournamentId) => `/api/v1/tkr/tournaments/${tournamentId}/config`,
        updateConfig: (tournamentId) => `/api/v1/tkr/tournaments/${tournamentId}/config`,
        
        // Team registration
        registerTeam: (tournamentId) => `/api/v1/tkr/tournaments/${tournamentId}/register`,
        getRegistrations: (tournamentId) => `/api/v1/tkr/tournaments/${tournamentId}/registrations`,
        updateRegistration: (registrationId) => `/api/v1/tkr/registrations/${registrationId}`,
        
        // Game submissions
        submitGame: (tournamentId) => `/api/v1/tkr/tournaments/${tournamentId}/submissions`,
        bulkSubmit: (tournamentId) => `/api/v1/tkr/tournaments/${tournamentId}/bulk-submissions`,
        getSubmissions: (tournamentId) => `/api/v1/tkr/tournaments/${tournamentId}/submissions`,
        updateSubmission: (submissionId) => `/api/v1/tkr/submissions/${submissionId}`,
        deleteSubmission: (submissionId) => `/api/v1/tkr/submissions/${submissionId}`,
        
        // Leaderboard
        getLeaderboard: (tournamentId) => `/api/v1/tkr/tournaments/${tournamentId}/leaderboard`,
        refreshLeaderboard: (tournamentId) => `/api/v1/tkr/tournaments/${tournamentId}/leaderboard/refresh`,
        
        // Prize pool
        getPrizePool: (tournamentId) => `/api/v1/tkr/tournaments/${tournamentId}/prize-pool`,
        
        // Templates
        createTemplate: '/api/v1/tkr/templates',
        getTemplates: '/api/v1/tkr/templates',
        getTemplate: (templateId) => `/api/v1/tkr/templates/${templateId}`,
        updateTemplate: (templateId) => `/api/v1/tkr/templates/${templateId}`,
        deleteTemplate: (templateId) => `/api/v1/tkr/templates/${templateId}`,
        
        // Combined details
        getTournamentDetails: (tournamentId) => `/api/v1/tkr/tournaments/${tournamentId}/details`
      }
  },

  // Auth settings
  auth: {
      tokenStorageKey: 'token',
      userStorageKey: 'user',
      credentialsStorageKey: 'credentials',
      tokenExpiryDays: 30,
  }
};

// Validate required environment variables
const requiredVars = [
  'REACT_APP_API_URL',
];

if (config.isDevelopment || config.isTest) {
  for (const varName of requiredVars) {
      if (!process.env[varName]) {
          console.error(`Missing required environment variable: ${varName}`);
      }
  }
}

// Throw error in production if encryption key is default
if (config.isProduction && config.encryptionKey === 'default-key-replace-in-production') {
  throw new Error('Production requires a secure encryption key to be set in REACT_APP_ENCRYPTION_KEY');
}

export default config;