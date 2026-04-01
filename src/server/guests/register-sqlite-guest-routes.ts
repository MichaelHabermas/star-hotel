import type { Express } from 'express'
import type { HotelSqlitePersistencePort } from '../ports/hotel-sqlite-persistence-port'
import { createGuestRouter } from './guest-router'

export function registerSqliteGuestRoutes(app: Express, persistence: HotelSqlitePersistencePort): void {
  app.use('/api/guests', createGuestRouter(persistence))
}
