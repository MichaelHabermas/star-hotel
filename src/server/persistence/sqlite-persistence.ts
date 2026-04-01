import Database from 'better-sqlite3'
import { runMigrations } from '../db/run-migrations'
import type { PersistencePort } from '../ports/persistence'

export type SqlitePersistenceOptions = {
  readonly dbFilePath: string
}

type SqliteDatabase = InstanceType<typeof Database>

/**
 * Opens SQLite in the main process, enables WAL + foreign keys, runs migrations.
 * Single shared connection for the embedded API lifetime.
 */
export function createSqlitePersistencePort(options: SqlitePersistenceOptions): PersistencePort {
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
  }
}
