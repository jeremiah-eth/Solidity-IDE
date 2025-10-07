import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { Buffer } from 'buffer';
import process from 'process';

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
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ['solc'], // Exclude solc since we're using CDN
  },
  define: {
    'process.env': {}, // Define process.env for Node.js compatibility in browser
    global: 'globalThis', // Define global for Node.js packages
    'Buffer': 'Buffer', // Define Buffer for Node.js packages
    'process': 'process', // Define process for Node.js packages
  },
  worker: {
    format: 'es', // Use ES modules for workers
  },
});
