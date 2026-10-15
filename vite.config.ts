import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' makes the build work on any static host (Vercel, Netlify, GitHub Pages sub-path…)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: { host: true, port: 5173, allowedHosts: true },
});
