import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { mapErrorToHttp } from './http/json-error';
import { createHttpAccessLogMiddleware } from './logging/http-access-middleware';
import { embeddedApiLogger } from './logging/structured-logger';
import type { PersistencePort } from './ports/persistence';

/**
 * Allow the Vite dev server (and other local browser tooling) to call the embedded API.
 * The server binds to 127.0.0.1 only; reflecting loopback origins is safe for this surface.
 */
export function allowLocalhostBrowserCors(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  if (typeof origin === 'string' && origin.length > 0) {
    try {
      const u = new URL(origin);
      const loopback =
        (u.protocol === 'http:' || u.protocol === 'https:') &&
        (u.hostname === 'localhost' || u.hostname === '127.0.0.1');
      if (loopback) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
      }
    } catch {
      /* ignore malformed Origin */
    }
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');
    const acrh = req.headers['access-control-request-headers'];
    res.setHeader('Access-Control-Allow-Headers', typeof acrh === 'string' ? acrh : 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(204).end();
    return;
  }

  next();
}

/** CORS, JSON body, access logging — shared baseline for the embedded Express app. */
export function applyStarHotelExpressRequestPipeline(app: express.Express): void {
  app.use(allowLocalhostBrowserCors);
  app.use(express.json({ limit: '1mb' }));
  app.use(createHttpAccessLogMiddleware(embeddedApiLogger));
}

/** `/health` waits on persistence; OpenAPI + Swagger (dev / Vitest only — omitted from packaged main bundle). */
export async function registerStarHotelHealthAndOpenApi(
  app: express.Express,
  persistence: PersistencePort,
): Promise<void> {
  app.get(EMBEDDED_API_PATHS.health, async (_req, res) => {
    await persistence.isReady();
    res.status(200).json({ ok: true });
  });
  if (import.meta.env.STAR_HOTEL_INCLUDE_OPENAPI) {
    const { registerOpenApiRoutes } = await import('./openapi/register-openapi-routes.js');
    registerOpenApiRoutes(app);
  }
}

export function createStarHotelApiErrorHandler(): ErrorRequestHandler {
  return (err, req, res, next) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    mapErrorToHttp(res, err, `${req.method} ${req.path}`);
  };
}
