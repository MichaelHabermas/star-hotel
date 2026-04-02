import type { NextFunction, Request, Response } from 'express';
import { sendJsonError } from '../http/json-error';
import { getSession } from './session-store';

type RequestWithStarHotelUser = Request & {
  starHotelUser?: { id: number; username: string; role: string };
};

/**
 * Requires `Authorization: Bearer <token>` for embedded API routes except auth and docs.
 * Disabled when `STAR_HOTEL_SKIP_AUTH=1` (Vitest server tests).
 */
export function embeddedApiAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (process.env.STAR_HOTEL_SKIP_AUTH === '1') {
    next();
    return;
  }

  const path = req.path;
  if (path === '/health') {
    next();
    return;
  }
  if (path.startsWith('/api/openapi') || path === '/api/docs') {
    next();
    return;
  }
  if (path.startsWith('/api/auth')) {
    next();
    return;
  }

  const raw = req.headers.authorization;
  const token = raw?.startsWith('Bearer ') ? raw.slice(7) : undefined;
  if (!token) {
    sendJsonError(res, 401, 'UNAUTHORIZED', 'Missing or invalid session');
    return;
  }
  const session = getSession(token);
  if (!session) {
    sendJsonError(res, 401, 'UNAUTHORIZED', 'Missing or invalid session');
    return;
  }

  (req as RequestWithStarHotelUser).starHotelUser = {
    id: session.userId,
    username: session.username,
    role: session.role,
  };
  next();
}
