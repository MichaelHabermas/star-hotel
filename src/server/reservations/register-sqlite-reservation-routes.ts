import type { Express } from 'express';
import type { SqliteHttpAdapterKit } from '../http/sqlite-http-adapter-kit';
import { createReservationRouter } from './reservation-router';

/** Composition-root hook: mount reservation REST API when using SQLite persistence. */
export function registerSqliteReservationRoutes(app: Express, kit: SqliteHttpAdapterKit): void {
  app.use('/api/reservations', createReservationRouter(kit));
}
