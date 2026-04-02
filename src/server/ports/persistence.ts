/**
 * Narrow lifecycle port: readiness + shutdown. Used anywhere that only needs to wait for the DB
 * (IPC ping, `/health`) without touching SQL.
 *
 * For Express REST + repositories, use {@link HotelSqlitePersistencePort} instead — it extends
 * this type with `getDatabase()`.
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
