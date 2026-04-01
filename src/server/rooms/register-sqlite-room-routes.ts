import type { Express } from 'express'
import type { HotelSqlitePersistencePort } from '../ports/hotel-sqlite-persistence-port'
import { createRoomRouter } from './room-router'

export function registerSqliteRoomRoutes(app: Express, persistence: HotelSqlitePersistencePort): void {
  app.use('/api/rooms', createRoomRouter(persistence))
}
