import type { Express } from 'express';
import { embeddedApiAuthMiddleware } from './auth/embedded-api-auth-middleware';
import { registerAuthRoutes } from './auth/register-auth-routes';
import type { HotelSqlitePersistencePort } from './ports/hotel-sqlite-persistence-port';
import { registerMvpSqliteApiRoutes } from './register-mvp-sqlite-api-routes';

export type MvpSqliteApiComposition = {
  mount(app: Express): void;
};

/**
 * Façade for the default embedded-API path: one kit, one mount of guests / rooms / reservations.
 */
export function createMvpSqliteApiComposition(
  persistence: HotelSqlitePersistencePort,
): MvpSqliteApiComposition {
  return {
    mount(app: Express): void {
      registerAuthRoutes(app, persistence);
      app.use(embeddedApiAuthMiddleware);
      registerMvpSqliteApiRoutes(app, persistence);
    },
  };
}
