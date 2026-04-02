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
 * Single entry for the default embedded API domain stack (SQLite + Express).
 *
 * Middleware order (do not reorder without updating auth tests):
 * 1. `registerAuthRoutes` — `/api/auth/*` (login unauthenticated; logout/me use Bearer when present)
 * 2. `embeddedApiAuthMiddleware` — requires valid Bearer JWT for other `/api/*` routes
 * 3. `registerMvpSqliteApiRoutes` — guests, rooms, reservations, reports
 */
export function mountMvpSqliteEmbeddedApi(
  app: Express,
  persistence: HotelSqlitePersistencePort,
): void {
  const kit = createSqliteHttpAdapterKit(persistence);
  registerAuthRoutes(app, kit);
  app.use(embeddedApiAuthMiddleware);
  registerMvpSqliteApiRoutes(app, kit);
}

/**
 * Façade that pairs persistence with {@link mountMvpSqliteEmbeddedApi} for call sites that
 * hold persistence and mount later (e.g. embedded API startup).
 */
export function createMvpSqliteApiComposition(
  persistence: HotelSqlitePersistencePort,
): MvpSqliteApiComposition {
  return {
    mount(app: Express): void {
      mountMvpSqliteEmbeddedApi(app, persistence);
    },
  };
}
