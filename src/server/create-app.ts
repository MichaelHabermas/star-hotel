import express from 'express'
import type { PersistencePort } from './ports/persistence'
import { noopPersistencePort } from './ports/persistence'

export type CreateServerAppOptions = {
  persistence?: PersistencePort
}

/** Express app for the in-main API (no listen — main owns the HTTP server). */
export function createServerApp(options: CreateServerAppOptions = {}): express.Express {
  const persistence = options.persistence ?? noopPersistencePort

  const app = express()

  // Validate request bodies with Zod at HTTP boundaries when mutating routes are added.
  app.get('/health', async (_req, res) => {
    await persistence.isReady()
    res.status(200).json({ ok: true })
  })

  return app
}
