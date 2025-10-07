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
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || 'PLACEHOLDER_API_KEY')
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['@google/genai', 'firebase/app', 'firebase/firestore']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})