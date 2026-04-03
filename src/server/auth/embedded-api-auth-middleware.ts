import { embeddedApiPathnameExemptFromBearer } from '@shared/api/embedded-api-public-access';
import type { NextFunction, Request, Response } from 'express';
import { sendJsonError } from '../http/json-error';
import type { StarHotelSessionStore } from './session-store';

export type StarHotelAuthenticatedUser = { id: number; username: string; role: string };

type RequestWithStarHotelUser = Request & {
  starHotelUser?: StarHotelAuthenticatedUser;
};

export function getStarHotelUser(req: Request): StarHotelAuthenticatedUser | undefined {
  return (req as RequestWithStarHotelUser).starHotelUser;
}

export type CreateEmbeddedApiAuthMiddlewareOptions = {
  readonly sessionStore: StarHotelSessionStore;
  /** When true, skip Bearer checks (prefer `STAR_HOTEL_SKIP_AUTH` in Vitest). */
  readonly skipAuth?: boolean;
};

/**
 * Requires `Authorization: Bearer <token>` for embedded API routes except auth and docs.
 * Disabled when `STAR_HOTEL_SKIP_AUTH=1` (Vitest server tests) or {@link CreateEmbeddedApiAuthMiddlewareOptions.skipAuth}.
 */
export function createEmbeddedApiAuthMiddleware(
  options: CreateEmbeddedApiAuthMiddlewareOptions,
): (req: Request, res: Response, next: NextFunction) => void {
  const { sessionStore, skipAuth } = options;
  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.STAR_HOTEL_SKIP_AUTH === '1' || skipAuth) {
      next();
      return;
    }

    if (embeddedApiPathnameExemptFromBearer(req.path)) {
      next();
      return;
    }

    const raw = req.headers.authorization;
    const token = raw?.startsWith('Bearer ') ? raw.slice(7) : undefined;
    if (!token) {
      sendJsonError(res, 401, 'UNAUTHORIZED', 'Missing or invalid session');
      return;
    }
    const session = sessionStore.getSession(token);
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
  };
}
