import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base '/' is required for clean URLs (/tutor, /journey/run): relative asset paths would break on nested routes.
// Host at a domain root (Vercel). A sub-path host (GitHub Pages /repo/) would need base: '/repo/'.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: { host: true, port: 5173, allowedHosts: true },
});
