import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Keep existing Netlify REACT_APP_* values working during the migration.
  envPrefix: ['VITE_', 'REACT_APP_'],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js'],
    css: true,
  },
});
