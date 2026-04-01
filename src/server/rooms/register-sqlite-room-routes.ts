import type { Express } from 'express'
import type { SqlitePersistencePort } from '../persistence/sqlite-persistence'
import { createRoomRouter } from './room-router'

export function registerSqliteRoomRoutes(app: Express, persistence: SqlitePersistencePort): void {
  app.use('/api/rooms', createRoomRouter(persistence))
}
