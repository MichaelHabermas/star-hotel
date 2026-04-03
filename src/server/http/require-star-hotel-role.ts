import type { NextFunction, Request, Response } from 'express';
import { getStarHotelUser } from '../auth/embedded-api-auth-middleware';
import { sendJsonError } from './json-error';

export function requireStarHotelRoles(...roles: string[]) {
  const lower = roles.map((r) => r.toLowerCase());
  return (req: Request, res: Response, next: NextFunction): void => {
    const u = getStarHotelUser(req);
    if (!u) {
      sendJsonError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
      return;
    }
    if (!lower.includes(u.role.trim().toLowerCase())) {
      sendJsonError(res, 403, 'FORBIDDEN', 'Insufficient role');
      return;
    }
    next();
  };
}
