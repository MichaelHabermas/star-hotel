import Database from 'better-sqlite3'
import { runMigrations } from '../db/run-migrations'
import { seedDefaultUserIfNeeded } from '../dev/seed-default-user'
import { seedDevReservationsIfNeeded } from '../dev/seed-dev-reservations'
import type { HotelSqlitePersistencePort } from '../ports/hotel-sqlite-persistence-port'
import type { PersistencePort } from '../ports/persistence'

export type SqlitePersistenceOptions = {
  readonly dbFilePath: string
  /** When true (unpackaged Electron), seed fake reservations if DB has none. */
  readonly seedDevData?: boolean
}

type SqliteDatabase = InstanceType<typeof Database>

/** @alias Production SQLite implementation of {@link HotelSqlitePersistencePort}. */
export type SqlitePersistencePort = HotelSqlitePersistencePort

export function isSqlitePersistencePort(p: PersistencePort): p is HotelSqlitePersistencePort {
  return typeof (p as HotelSqlitePersistencePort).getDatabase === 'function'
}

/**
 * Opens SQLite in the main process, enables WAL + foreign keys, runs migrations.
 * Single shared connection for the embedded API lifetime.
 */
export function createSqlitePersistencePort(
  options: SqlitePersistenceOptions,
): SqlitePersistencePort {
  let db: SqliteDatabase | null = null

  return {
    async isReady() {
      if (db) {
        return
      }
      const database = new Database(options.dbFilePath)
      database.pragma('journal_mode = WAL')
      database.pragma('foreign_keys = ON')
      runMigrations(database)
      seedDefaultUserIfNeeded(database)
      if (options.seedDevData) {
        seedDevReservationsIfNeeded(database)
      }
      db = database
    },
    async close() {
      if (!db) {
        return
      }
      const toClose = db
      db = null
      toClose.close()
    },
    getDatabase() {
      if (!db) {
        throw new Error('[star-hotel] getDatabase() called before isReady() completed')
      }
      return db
    },
  }
}
