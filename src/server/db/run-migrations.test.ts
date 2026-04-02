import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { runMigrations } from './run-migrations';

type SqliteDatabase = InstanceType<typeof Database>;

function openTestDb(): SqliteDatabase {
  const db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

describe('runMigrations', () => {
  it('creates legacy tables and is idempotent', () => {
    const db = openTestDb();
    runMigrations(db);
    runMigrations(db);

    const rows = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      )
      .all() as { name: string }[];

    const names = rows.map((r) => r.name);
    expect(names).toContain('tbl_room');
    expect(names).toContain('tbl_guest');
    expect(names).toContain('tbl_reservation');
    expect(names).toContain('tbl_user');
    expect(names).toContain('schema_migrations');

    const versions = db.prepare('SELECT version FROM schema_migrations ORDER BY version').all() as {
      version: number;
    }[];
    expect(versions.map((v) => v.version)).toEqual([1]);

    const bookingIndex = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='index' AND name='idx_reservation_room_dates'`,
      )
      .get() as { name: string } | undefined;
    expect(bookingIndex?.name).toBe('idx_reservation_room_dates');
  });
});
