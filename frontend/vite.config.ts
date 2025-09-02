import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    // If you need CORS for development
    cors: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  // Environment variable prefix - Vite uses VITE_ instead of REACT_APP_
  envPrefix: ['VITE_', 'REACT_APP_'],
  define: {
    // This ensures process.env works for your existing code
    'process.env': process.env,
  },
})