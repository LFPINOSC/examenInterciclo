import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El proxy redirige /api al backend Spring Boot (puerto 8080),
// así el navegador no tiene problemas de CORS durante el desarrollo.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
