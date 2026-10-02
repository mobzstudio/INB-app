import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig } from 'vitest/config'
import { handle } from './server/api'

const pages = Boolean(process.env.GITHUB_PAGES)

export default defineConfig({
  base: pages ? './' : '/',
  build: pages
    ? {
        cssCodeSplit: false,
        rollupOptions: {
          output: {
            format: 'iife',
            inlineDynamicImports: true,
          },
        },
      }
    : undefined,
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
