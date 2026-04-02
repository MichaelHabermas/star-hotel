import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import type winston from 'winston'

/**
 * Request id + duration + route path (no query/body per T7).
 */
export function createHttpAccessLogMiddleware(logger: winston.Logger) {
  return function httpAccessLog(req: Request, res: Response, next: NextFunction): void {
    const requestId = randomUUID()
    res.setHeader('x-request-id', requestId)
    const start = Date.now()
    res.on('finish', () => {
      logger.info('http.access', {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
      })
    })
    next()
  }
}
