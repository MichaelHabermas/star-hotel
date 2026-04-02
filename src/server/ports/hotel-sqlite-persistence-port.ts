import Database from 'better-sqlite3';
import type { PersistencePort } from './persistence';

type SqliteDatabase = InstanceType<typeof Database>;

/**
 * Persistence exposed to MVP REST routers: lifecycle + SQLite handle for repositories.
 * Implementations: `createSqlitePersistencePort` (production/tests).
 */
export type HotelSqlitePersistencePort = PersistencePort & {
  getDatabase(): SqliteDatabase;
};
