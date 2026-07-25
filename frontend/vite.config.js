import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['maplibre-gl']
  },
  server: {
    port: 5173,
    proxy: {
      //byklm el backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        timeout: 120000,       // 2 minutes — Gemini + geocoding can be slow
        proxyTimeout: 120000,  // Also set the proxy-side timeout
        configure: (proxy) => {
          // Log proxy errors instead of crashing with a generic 502
          proxy.on('error', (err, _req, res) => {
            console.error('[Vite Proxy Error]', err.message);
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: 'Backend unreachable. Make sure the backend server is running on port 8080.',
                details: err.message,
              }));
            }
          });
        },
      },
    },
  },
})