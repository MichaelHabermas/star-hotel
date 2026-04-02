import type { Express } from 'express'
import type { SqliteHttpAdapterKit } from '../http/sqlite-http-adapter-kit'
import { createGuestRouter } from './guest-router'

export function registerSqliteGuestRoutes(app: Express, kit: SqliteHttpAdapterKit): void {
  app.use('/api/guests', createGuestRouter(kit))
}
