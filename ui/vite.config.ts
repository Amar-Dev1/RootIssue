import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './', // Critical: Makes paths relative for Chrome
  build: {
    outDir: 'dist', // Output folder
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'), // Entry point
      },
    },
  },
})   