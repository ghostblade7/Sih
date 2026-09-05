import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  base: '/Sih/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        login: resolve(process.cwd(), 'login.html')
      }
    }
  }
})
