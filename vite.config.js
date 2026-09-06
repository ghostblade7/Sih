import {defineConfig} from 'vite'
import {resolve} from 'node:path'

export default defineConfig({
  base:'/',
  build:{rollupOptions:{input:{main:resolve(process.cwd(),'index.html'),auth:resolve(process.cwd(),'auth.html'),profile:resolve(process.cwd(),'profile.html')}}}
})
