import type { Express } from 'express'
import type { SqlitePersistencePort } from '../persistence/sqlite-persistence'
import { createReservationRouter } from './reservation-router'

/** Composition-root hook: mount reservation REST API when using SQLite persistence. */
export function registerSqliteReservationRoutes(
  app: Express,
  persistence: SqlitePersistencePort,
): void {
  app.use('/api/reservations', createReservationRouter(persistence))
}
