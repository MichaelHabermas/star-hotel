import type { Express } from 'express'
import type { HotelSqlitePersistencePort } from './ports/hotel-sqlite-persistence-port'
import { registerMvpSqliteApiRoutes } from './register-mvp-sqlite-api-routes'

export type MvpSqliteApiComposition = {
  mount(app: Express): void
}

/**
 * Façade for the default embedded-API path: one kit, one mount of guests / rooms / reservations.
 */
export function createMvpSqliteApiComposition(persistence: HotelSqlitePersistencePort): MvpSqliteApiComposition {
  return {
    mount(app: Express): void {
      registerMvpSqliteApiRoutes(app, persistence)
    },
  }
}
