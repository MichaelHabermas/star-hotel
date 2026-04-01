import Database from 'better-sqlite3'
import { runMigrations } from '../db/run-migrations'
import type { PersistencePort } from '../ports/persistence'

export type SqlitePersistenceOptions = {
  readonly dbFilePath: string
}

type SqliteDatabase = InstanceType<typeof Database>

export type SqlitePersistencePort = PersistencePort & {
  getDatabase(): SqliteDatabase
}

export function isSqlitePersistencePort(p: PersistencePort): p is SqlitePersistencePort {
  return typeof (p as SqlitePersistencePort).getDatabase === 'function'
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
