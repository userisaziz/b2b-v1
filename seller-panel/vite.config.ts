import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
     alias: {
      "@": "/src",
    },
    dedupe: ['react', 'react-dom']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
       manualChunks: {
  'vendor-react': ['react', 'react-dom'],
  'vendor-radix': ['@radix-ui/react-select', '@radix-ui/react-label']
}
  
      }
    }
  }
})