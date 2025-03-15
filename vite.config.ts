import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    watch: {
      usePolling: true,
    },
    host: true, // needed for the Docker container port mapping to work
    strictPort: true,
    port: 5173, // you can replace this port with any port
  }
});