import { defineConfig } from 'vite'
import { ClientPlugin } from './plugins/client'

export default defineConfig({
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  optimizeDeps: {
    include: ['@webcontainer/api'],
  },
  plugins: [ClientPlugin()],
})
