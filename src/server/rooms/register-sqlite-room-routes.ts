import type { Express } from 'express'
import type { SqliteHttpAdapterKit } from '../http/sqlite-http-adapter-kit'
import { createRoomRouter } from './room-router'

export function registerSqliteRoomRoutes(app: Express, kit: SqliteHttpAdapterKit): void {
  app.use('/api/rooms', createRoomRouter(kit))
}
