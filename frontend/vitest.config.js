import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],
    css: false,
    env: {
      VITE_BACKEND_URL: 'http://localhost:3000',
      VITE_COGNITO_CLIENT_ID: 'test-client-id',
      VITE_COGNITO_REDIRECT_URI: 'http://localhost:5173',
      VITE_COGNITO_DOMAIN: 'https://test.auth.example.com',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/__tests__/**'],
    },
  },
});
