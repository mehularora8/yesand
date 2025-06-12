import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vercelApi from 'vite-plugin-vercel-api';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vercelApi()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
