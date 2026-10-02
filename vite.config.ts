import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig } from 'vitest/config'
import { handle } from './server/api'

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/INB-app/' : '/',
  plugins: [
    react(),
    {
      name: 'maia-agent',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/api')) return next()
          handle(req as IncomingMessage, res as ServerResponse).catch(next)
        })
      },
    },
  ],
  test: {
    environment: 'node',
  },
})
