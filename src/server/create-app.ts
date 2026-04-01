import express, { type ErrorRequestHandler, type NextFunction, type Request, type Response } from 'express'
import { mapErrorToHttp } from './http/json-error'
import { registerOpenApiRoutes } from './openapi/register-openapi-routes'
import { noopPersistencePort, type PersistencePort } from './ports/persistence'

/**
 * Allow the Vite dev server (and other local browser tooling) to call the embedded API.
 * The server binds to 127.0.0.1 only; reflecting loopback origins is safe for this surface.
 */
function allowLocalhostBrowserCors(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin
  if (typeof origin === 'string' && origin.length > 0) {
    try {
      const u = new URL(origin)
      const loopback =
        (u.protocol === 'http:' || u.protocol === 'https:') &&
        (u.hostname === 'localhost' || u.hostname === '127.0.0.1')
      if (loopback) {
        res.setHeader('Access-Control-Allow-Origin', origin)
        res.setHeader('Vary', 'Origin')
      }
    } catch {
      /* ignore malformed Origin */
    }
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS')
    const acrh = req.headers['access-control-request-headers']
    res.setHeader(
      'Access-Control-Allow-Headers',
      typeof acrh === 'string' ? acrh : 'Content-Type',
    )
    res.setHeader('Access-Control-Max-Age', '86400')
    res.status(204).end()
    return
  }

  next()
}

export type CreateServerAppOptions = {
  persistence?: PersistencePort
  /** Mount `/api/*` routes (composition root). Omitted when only `/health` is needed. */
  registerApiRoutes?: (app: express.Express) => void
}

/** Express app for the in-main API (no listen — main owns the HTTP server). */
export function createServerApp(options: CreateServerAppOptions = {}): express.Express {
  const persistence = options.persistence ?? noopPersistencePort

  const app = express()

  app.use(allowLocalhostBrowserCors)
  app.use(express.json({ limit: '1mb' }))

  app.get('/health', async (_req, res) => {
    await persistence.isReady()
    res.status(200).json({ ok: true })
  })

  registerOpenApiRoutes(app)

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
