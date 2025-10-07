import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  define: {
    // Durante lo sviluppo, usa la variabile d'ambiente
    // In produzione, sarà sostituita da replace.js dopo il build
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || 'PLACEHOLDER_API_KEY')
  }
})