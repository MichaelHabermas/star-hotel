import type { Express } from 'express';
import { registerSqliteGuestRoutes } from './guests/register-sqlite-guest-routes';
import type { SqliteHttpAdapterKit } from './http/sqlite-http-adapter-kit';
import { registerSqliteReportRoutes } from './reports/register-sqlite-report-routes';
import { registerSqliteReservationRoutes } from './reservations/register-sqlite-reservation-routes';
import { registerSqliteRoomRoutes } from './rooms/register-sqlite-room-routes';

/**
 * Single composition-root entry for MVP domain REST (guests, rooms, reservations).
 * Keeps main and integration tests from duplicating mount order.
 */
export function registerMvpSqliteApiRoutes(app: Express, kit: SqliteHttpAdapterKit): void {
  registerSqliteGuestRoutes(app, kit);
  registerSqliteRoomRoutes(app, kit);
  registerSqliteReservationRoutes(app, kit);
  registerSqliteReportRoutes(app, kit);
}
