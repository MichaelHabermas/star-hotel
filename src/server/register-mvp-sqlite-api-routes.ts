import type { Express } from 'express';
import { registerSqliteGuestRoutes } from './guests/register-sqlite-guest-routes';
import { createSqliteHttpAdapterKit } from './http/sqlite-http-adapter-kit';
import type { HotelSqlitePersistencePort } from './ports/hotel-sqlite-persistence-port';
import { registerSqliteReservationRoutes } from './reservations/register-sqlite-reservation-routes';
import { registerSqliteRoomRoutes } from './rooms/register-sqlite-room-routes';

/**
 * Single composition-root entry for MVP domain REST (guests, rooms, reservations).
 * Keeps main and integration tests from duplicating mount order.
 */
export function registerMvpSqliteApiRoutes(
  app: Express,
  persistence: HotelSqlitePersistencePort,
): void {
  const kit = createSqliteHttpAdapterKit(persistence);
  registerSqliteGuestRoutes(app, kit);
  registerSqliteRoomRoutes(app, kit);
  registerSqliteReservationRoutes(app, kit);
}
