import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:3500',
        changeOrigin: true,
      },
      '/notes': {
        target: 'http://localhost:3500',
        changeOrigin: true,
      },
      '/public': {
        target: 'http://localhost:3500',
        changeOrigin: true,
      },
    },
  },
})
