import type { Express } from 'express'
import type { SqlitePersistencePort } from '../persistence/sqlite-persistence'
import { createGuestRouter } from './guest-router'

export function registerSqliteGuestRoutes(app: Express, persistence: SqlitePersistencePort): void {
  app.use('/api/guests', createGuestRouter(persistence))
}
