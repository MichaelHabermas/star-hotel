/**
 * Port for persisted hotel data (SQLite via better-sqlite3 in main, WAL mode).
 * Production wiring will inject a real implementation; tests use {@link noopPersistencePort}.
 */
export type PersistencePort = {
  /** Resolve when the backing store is safe to read (future: migrations done). */
  isReady(): Promise<void>;
  /** Idempotent: safe to call multiple times. */
  close(): Promise<void>;
};

export const noopPersistencePort: PersistencePort = {
  async isReady() {
    /* SQLite adapter will open the DB and run migrations here. */
  },
  async close() {
    /* no-op */
  },
};
