import type { Express } from 'express'
import type { HotelSqlitePersistencePort } from '../ports/hotel-sqlite-persistence-port'
import { createReservationRouter } from './reservation-router'

/** Composition-root hook: mount reservation REST API when using SQLite persistence. */
export function registerSqliteReservationRoutes(
  app: Express,
  persistence: HotelSqlitePersistencePort,
): void {
  app.use('/api/reservations', createReservationRouter(persistence))
}
