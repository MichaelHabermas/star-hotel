import Database from 'better-sqlite3';
import { runMigrations } from '../db/run-migrations';
import { seedDefaultUserIfNeeded } from '../dev/seed-default-user';
import { seedDevReservationsIfNeeded } from '../dev/seed-dev-reservations';

export type SqlitePersistenceStartupOptions = {
  /** When true (unpackaged Electron), seed fake reservations if DB has none. */
  readonly seedDevData?: boolean;
};

type SqliteDatabase = InstanceType<typeof Database>;

export function applySqlitePersistencePragmas(database: SqliteDatabase): void {
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');
}

/**
 * WAL + FK, migrations, default user, optional dev seed — order is part of the contract.
 */
export function runSqlitePersistenceStartup(
  database: SqliteDatabase,
  options: SqlitePersistenceStartupOptions,
): void {
  applySqlitePersistencePragmas(database);
  runMigrations(database);
  seedDefaultUserIfNeeded(database);
  if (options.seedDevData) {
    seedDevReservationsIfNeeded(database);
  }
}
