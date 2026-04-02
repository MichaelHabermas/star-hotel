import Database from 'better-sqlite3';
import type { PersistencePort } from './persistence';

type SqliteDatabase = InstanceType<typeof Database>;

/**
 * Persistence for the embedded API: same lifecycle as {@link PersistencePort} plus a SQLite
 * connection for repositories. IPC handlers typically receive {@link PersistencePort} only; the
 * Express stack and `mountMvpSqliteEmbeddedApi` require this wider port.
 *
 * Implementations: {@link createSqlitePersistencePort} in `persistence/sqlite-persistence.ts`.
 */
export type HotelSqlitePersistencePort = PersistencePort & {
  getDatabase(): SqliteDatabase;
};
