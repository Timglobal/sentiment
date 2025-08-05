import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,  // Disable in production for security
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          charts: ['chart.js', 'vue-chartjs']
        }
      }
    }
  },
  server: {
    port: 3001,
    allowedHosts: ["3001--main--safehands--emma66886.workspace.kinemlabs.com"]
  },
  preview: {
    port: 4173,
    host: true  // Allow external connections
  }
})
