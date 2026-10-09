import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://localhost:7223',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'https://localhost:7223',
        changeOrigin: true,
        secure: false,
      },
      '/openapi': {
        target: 'https://localhost:7223',
        changeOrigin: true,
        secure: false,
      },
      '/scalar': {
        target: 'https://localhost:7223',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), mkcert()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui')) return 'vendor-mui';
            if (id.includes('leaflet')) return 'vendor-leaflet';
            if (id.includes('@tanstack')) return 'vendor-query';
          }
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
