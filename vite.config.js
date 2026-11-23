import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/app-manager',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Proxies API calls in dev to avoid CORS issues against the remote authService.
      '/api': {
        target: 'http://adgdev.fmdqgroup.com',
        changeOrigin: true,
        rewrite: (path) => `/authService${path}`,
      },
    },
  },
})
