import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/cars':     'http://localhost:3000',
      '/bookings': 'http://localhost:3000',
      '/health':   'http://localhost:3000',
    }
  }
})
