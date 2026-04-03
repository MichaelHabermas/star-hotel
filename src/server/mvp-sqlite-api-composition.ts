import type { Express } from 'express';
import { createEmbeddedApiAuthMiddleware } from './auth/embedded-api-auth-middleware';
import { registerAuthRoutes } from './auth/register-auth-routes';
import { createInMemorySessionStore, type StarHotelSessionStore } from './auth/session-store';
import { createSqliteHttpAdapterKit } from './http/sqlite-http-adapter-kit';
import type { HotelSqlitePersistencePort } from './ports/hotel-sqlite-persistence-port';
import { registerMvpSqliteApiRoutes } from './register-mvp-sqlite-api-routes';

export type MvpSqliteApiComposition = {
  mount(app: Express): void;
};

export type MountMvpSqliteEmbeddedApiOptions = {
  /** Defaults to a fresh in-memory store per mount call. */
  readonly sessionStore?: StarHotelSessionStore;
};

/**
 * Single entry for the default embedded API domain stack (SQLite + Express).
 *
 * Middleware order (do not reorder without updating auth tests):
 * 1. `registerAuthRoutes` — `/api/auth/*` (login unauthenticated; logout/me use Bearer when present)
 * 2. `createEmbeddedApiAuthMiddleware` — requires valid Bearer JWT for other `/api/*` routes
 * 3. `registerMvpSqliteApiRoutes` — guests, rooms, reservations, reports
 */
export function mountMvpSqliteEmbeddedApi(
  app: Express,
  persistence: HotelSqlitePersistencePort,
  options?: MountMvpSqliteEmbeddedApiOptions,
): void {
  const sessionStore = options?.sessionStore ?? createInMemorySessionStore();
  const kit = createSqliteHttpAdapterKit(persistence);
  registerAuthRoutes(app, kit, { sessionStore });
  app.use(createEmbeddedApiAuthMiddleware({ sessionStore }));
  registerMvpSqliteApiRoutes(app, kit);
}

/**
 * Façade that pairs persistence with {@link mountMvpSqliteEmbeddedApi} for call sites that
 * hold persistence and mount later (e.g. embedded API startup).
 */
export function createMvpSqliteApiComposition(
  persistence: HotelSqlitePersistencePort,
  options?: MountMvpSqliteEmbeddedApiOptions,
): MvpSqliteApiComposition {
  const sessionStore = options?.sessionStore ?? createInMemorySessionStore();
  return {
    mount(app: Express): void {
      mountMvpSqliteEmbeddedApi(app, persistence, { sessionStore });
    },
  };
}
