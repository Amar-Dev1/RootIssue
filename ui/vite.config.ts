import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // Critical: Makes paths relative for Chrome
  plugins: [react()],
  build: {
    outDir: 'dist', // Output folder
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'), // Entry point
        background: resolve(__dirname, 'background.ts'), // Service worker
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
})   