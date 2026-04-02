import type { Express } from 'express';
import { embeddedApiAuthMiddleware } from './auth/embedded-api-auth-middleware';
import { registerAuthRoutes } from './auth/register-auth-routes';
import { createSqliteHttpAdapterKit } from './http/sqlite-http-adapter-kit';
import type { HotelSqlitePersistencePort } from './ports/hotel-sqlite-persistence-port';
import { registerMvpSqliteApiRoutes } from './register-mvp-sqlite-api-routes';

export type MvpSqliteApiComposition = {
  mount(app: Express): void;
};

/**
 * Façade for the default embedded-API path: one {@link SqliteHttpAdapterKit}, auth + domain REST.
 */
export function createMvpSqliteApiComposition(
  persistence: HotelSqlitePersistencePort,
): MvpSqliteApiComposition {
  return {
    mount(app: Express): void {
      const kit = createSqliteHttpAdapterKit(persistence);
      registerAuthRoutes(app, kit);
      app.use(embeddedApiAuthMiddleware);
      registerMvpSqliteApiRoutes(app, kit);
    },
  };
}
