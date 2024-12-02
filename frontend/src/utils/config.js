// src/utils/config.js
const config = {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    jwtSecret: process.env.REACT_APP_JWT_SECRET,
    tokenExpiry: Number(process.env.REACT_APP_TOKEN_EXPIRY || '30'),
    
    // Environment checks
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    
    // API endpoints
    endpoints: {
      auth: {
        login: '/auth/login',
        register: '/auth/register',
        refresh: '/auth/refresh',
        logout: '/auth/logout',
      },
      tournaments: {
        list: '/tournaments',
        create: '/tournaments',
        details: (id) => `/tournaments/${id}`,
        update: (id) => `/tournaments/${id}`,
        delete: (id) => `/tournaments/${id}`,
      },
      users: {
        profile: '/users/profile',
        update: '/users/profile',
      },
    },
  };
  
  // Validate required environment variables
  const requiredVars = ['REACT_APP_API_URL'];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`Missing required environment variable: ${varName}`);
    }
  }
  
  export default config;