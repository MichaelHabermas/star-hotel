import type { Express } from 'express';
import { registerGuestRoutes } from './guests/guest-router';
import type { SqliteHttpAdapterKit } from './http/sqlite-http-adapter-kit';
import { registerReportRoutes } from './reports/report-router';
import { registerReservationRoutes } from './reservations/reservation-router';
import { registerRoomRoutes } from './rooms/room-router';

/**
 * Orchestrates MVP domain REST mount order (guests, rooms, reservations, reports).
 * Per-slice registration lives next to each router.
 */
export function registerMvpSqliteApiRoutes(app: Express, kit: SqliteHttpAdapterKit): void {
  registerGuestRoutes(app, kit);
  registerRoomRoutes(app, kit);
  registerReservationRoutes(app, kit);
  registerReportRoutes(app, kit);
}
