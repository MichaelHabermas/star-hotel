import express from 'express'

/** Express app for the in-main API (no listen — main owns the HTTP server). */
export function createServerApp(): express.Express {
  const app = express()

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true })
  })

  return app
}
