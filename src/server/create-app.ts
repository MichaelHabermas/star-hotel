import express, { type ErrorRequestHandler } from 'express'
import { mapErrorToHttp } from './http/json-error'
import { noopPersistencePort, type PersistencePort } from './ports/persistence'

export type CreateServerAppOptions = {
  persistence?: PersistencePort
  /** Mount `/api/*` routes (composition root). Omitted when only `/health` is needed. */
  registerApiRoutes?: (app: express.Express) => void
}

/** Express app for the in-main API (no listen — main owns the HTTP server). */
export function createServerApp(options: CreateServerAppOptions = {}): express.Express {
  const persistence = options.persistence ?? noopPersistencePort

  const app = express()

  app.use(express.json({ limit: '1mb' }))

  app.get('/health', async (_req, res) => {
    await persistence.isReady()
    res.status(200).json({ ok: true })
  })

  options.registerApiRoutes?.(app)

  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (res.headersSent) {
      next(err)
      return
    }
    mapErrorToHttp(res, err, `${req.method} ${req.path}`)
  }
  app.use(errorHandler)

  return app
}
