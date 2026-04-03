import Database from 'better-sqlite3';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as runMigrationsModule from '../db/run-migrations';
import * as seedDefaultUserModule from '../dev/seed-default-user';
import * as seedDevReservationsModule from '../dev/seed-dev-reservations';
import { applySqlitePersistencePragmas, runSqlitePersistenceStartup } from './sqlite-startup';

describe('runSqlitePersistenceStartup', () => {
  let db: InstanceType<typeof Database>;

  beforeEach(() => {
    db = new Database(':memory:');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    db?.close();
  });

  it('runs migrations, default user seed, then optional dev seed in order', () => {
    const order: string[] = [];
    vi.spyOn(runMigrationsModule, 'runMigrations').mockImplementation((d) => {
      order.push('migrations');
      expect(d).toBe(db);
    });
    vi.spyOn(seedDefaultUserModule, 'seedDefaultUserIfNeeded').mockImplementation((d) => {
      order.push('defaultUser');
      expect(d).toBe(db);
    });
    vi.spyOn(seedDevReservationsModule, 'seedDevReservationsIfNeeded').mockImplementation((d) => {
      order.push('devReservations');
      expect(d).toBe(db);
    });

    runSqlitePersistenceStartup(db, { seedDevData: true });
    expect(order).toEqual(['migrations', 'defaultUser', 'devReservations']);
  });

  it('skips dev reservations seed when seedDevData is false', () => {
    const devSpy = vi
      .spyOn(seedDevReservationsModule, 'seedDevReservationsIfNeeded')
      .mockImplementation(() => {});
    vi.spyOn(runMigrationsModule, 'runMigrations').mockImplementation(() => {});
    vi.spyOn(seedDefaultUserModule, 'seedDefaultUserIfNeeded').mockImplementation(() => {});

    runSqlitePersistenceStartup(db, {});
    expect(devSpy).not.toHaveBeenCalled();
  });

  it('applies WAL and foreign_keys before migrations (file DB)', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'star-hotel-sqlite-startup-'));
    const filePath = path.join(dir, 'wal-test.db');
    const fileDb = new Database(filePath);
    try {
      runSqlitePersistenceStartup(fileDb, {});
      const journal = fileDb.pragma('journal_mode', { simple: true }) as string;
      expect(String(journal).toLowerCase()).toContain('wal');
      expect(fileDb.pragma('foreign_keys', { simple: true })).toBe(1);
    } finally {
      fileDb.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('applySqlitePersistencePragmas', () => {
  it('sets journal_mode and foreign_keys on a file database', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'star-hotel-sqlite-pragmas-'));
    const filePath = path.join(dir, 'pragma-test.db');
    const database = new Database(filePath);
    try {
      applySqlitePersistencePragmas(database);
      const journal = database.pragma('journal_mode', { simple: true }) as string;
      expect(String(journal).toLowerCase()).toContain('wal');
      expect(database.pragma('foreign_keys', { simple: true })).toBe(1);
    } finally {
      database.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
