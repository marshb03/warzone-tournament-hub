// src/utils/config.js
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
          // Updated to match FastAPI endpoints
          login: '/api/v1/login/access-token',
          register: '/api/v1/users/users',  // User registration endpoint
          testToken: '/api/v1/test-token',  // Endpoint to verify token
          passwordReset: '/api/v1/password-reset',
          passwordResetConfirm: '/api/v1/password-reset-confirm',
      },
      tournaments: {
          list: '/api/v1/tournaments',
          create: '/api/v1/tournaments',
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
        create: '/api/v1/matches',
        createLosers: '/api/v1/matches/losers',
        details: (id) => `/api/v1/matches/${id}`,
        tournament: (id) => `/api/v1/matches/tournament/${id}`,
        update: (id) => `/api/v1/matches/${id}`,
        updateLosers: (id) => `/api/v1/matches/losers/${id}`,
        delete: (id) => `/api/v1/matches/${id}`,
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
  // Add other required variables as needed
];

if (config.isDevelopment || config.isTest) {
  // Only validate in development and test environments
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