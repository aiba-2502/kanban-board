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
    host: true, // Docker内で正しくホスティングするために必要
    strictPort: true,
    port: 5173, // 固定ポート
    // ログ出力レベルを指定
    hmr: {
      clientPort: 5173
    }
  }
});