import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import type { Express } from 'express';
import { createGuestRouter } from './guests/guest-router';
import type { SqliteHttpAdapterKit } from './http/sqlite-http-adapter-kit';
import { createReportRouter } from './reports/report-router';
import { createReservationRouter } from './reservations/reservation-router';
import { createRoomRouter } from './rooms/room-router';

/**
 * Single composition-root entry for MVP domain REST (guests, rooms, reservations, reports).
 * Keeps main and integration tests from duplicating mount order.
 */
export function registerMvpSqliteApiRoutes(app: Express, kit: SqliteHttpAdapterKit): void {
  app.use(EMBEDDED_API_PATHS.guests, createGuestRouter(kit));
  app.use(EMBEDDED_API_PATHS.rooms, createRoomRouter(kit));
  app.use(EMBEDDED_API_PATHS.reservations, createReservationRouter(kit));
  app.use(EMBEDDED_API_PATHS.reports, createReportRouter(kit));
}
