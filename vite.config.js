import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3000
  },
  
  build: {
    // Optimizaciones de producción
    target: 'esnext',
    minify: 'esbuild', // Cambiado a esbuild (más rápido y viene incluido)
    cssMinify: true,
    
    // Code splitting para mejor performance
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
        }
      },
      // Manejar warnings de dependencias opcionales
      onwarn(warning, warn) {
        // Ignorar warnings sobre exportaciones faltantes de dependencias opcionales
        if (warning.code === 'UNRESOLVED_IMPORT' || warning.code === 'MISSING_EXPORT') {
          if (warning.message.includes('BatchedMesh') || warning.message.includes('three-mesh-bvh')) {
            return
          }
        }
        warn(warning)
      }
    },
    
    // Compresión (esbuild minify options)
    // esbuild elimina console y debugger por defecto en producción
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Source maps solo para desarrollo
    sourcemap: false,
    
    // Optimización de assets
    assetsInlineLimit: 4096
  },
  
  // Optimización de dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei']
  }
})

