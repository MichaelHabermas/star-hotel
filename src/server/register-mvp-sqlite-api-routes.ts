import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import type { Express } from 'express';
import { registerGuestRoutes } from './guests/guest-router';
import type { SqliteHttpAdapterKit } from './http/sqlite-http-adapter-kit';
import { registerReportRoutes } from './reports/report-router';
import { registerReservationRoutes } from './reservations/reservation-router';
import { registerRoomRoutes } from './rooms/room-router';
import { registerUserAdminRoutes } from './users/register-user-admin-routes';

/**
 * Domain routers mounted by {@link registerMvpSqliteApiRoutes} — keep in sync with
 * `EMBEDDED_API_PATHS` and OpenAPI (see `mvp-sqlite-api-mount-paths.test.ts`).
 */
export const MVP_SQLITE_API_DOMAIN_MOUNT_PATHS = [
  EMBEDDED_API_PATHS.guests,
  EMBEDDED_API_PATHS.rooms,
  EMBEDDED_API_PATHS.reservations,
  EMBEDDED_API_PATHS.reports,
  EMBEDDED_API_PATHS.users,
] as const;

/**
 * Orchestrates MVP domain REST mount order (guests, rooms, reservations, reports, users).
 * Per-slice registration lives next to each router.
 */
export function registerMvpSqliteApiRoutes(app: Express, kit: SqliteHttpAdapterKit): void {
  registerGuestRoutes(app, kit);
  registerRoomRoutes(app, kit);
  registerReservationRoutes(app, kit);
  registerReportRoutes(app, kit);
  registerUserAdminRoutes(app, kit);
}
