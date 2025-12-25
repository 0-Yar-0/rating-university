import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env vars so we can use VITE_API_PROXY_TARGET in .env.development
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5000';

  return {
    build: { sourcemap: true },
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Proxy /api requests to the backend to avoid CORS and to allow cookies to be set
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
          // Keep path as-is, credentials are forwarded by proxy (same-origin)
        },
      },
    },
  };
});
