import type DatabaseType from 'better-sqlite3'

/** Forward-only migrations; version numbers must be unique and monotonic. */
const MIGRATIONS: readonly { readonly version: number; readonly sql: string }[] = [
  {
    version: 1,
    sql: `
CREATE TABLE IF NOT EXISTS tbl_room (
  RoomID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  RoomType TEXT NOT NULL,
  Price REAL NOT NULL CHECK (Price >= 0),
  Status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tbl_guest (
  GuestID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  Name TEXT NOT NULL,
  ID_Number TEXT,
  Contact TEXT
);

CREATE TABLE IF NOT EXISTS tbl_user (
  UserID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  Username TEXT NOT NULL UNIQUE,
  Password TEXT NOT NULL,
  Role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tbl_reservation (
  ResID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  RoomID INTEGER NOT NULL REFERENCES tbl_room(RoomID) ON DELETE RESTRICT,
  GuestID INTEGER NOT NULL REFERENCES tbl_guest(GuestID) ON DELETE RESTRICT,
  CheckInDate TEXT NOT NULL,
  CheckOutDate TEXT NOT NULL,
  TotalAmount REAL NOT NULL CHECK (TotalAmount >= 0),
  CHECK (CheckOutDate >= CheckInDate)
);

CREATE INDEX IF NOT EXISTS idx_reservation_room ON tbl_reservation(RoomID);
CREATE INDEX IF NOT EXISTS idx_reservation_guest ON tbl_reservation(GuestID);
CREATE INDEX IF NOT EXISTS idx_reservation_room_dates ON tbl_reservation(RoomID, CheckInDate, CheckOutDate);
`,
  },
]

/**
 * Applies pending migrations in order. Safe to call on every startup (idempotent).
 * Expects the database connection to be open; sets WAL + foreign_keys on the caller side.
 */
type SqliteDatabase = InstanceType<typeof DatabaseType>

export function runMigrations(db: SqliteDatabase): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  const appliedRows = db.prepare('SELECT version FROM schema_migrations').all() as {
    version: number
  }[]
  const applied = new Set(appliedRows.map((r) => r.version))

  for (const m of MIGRATIONS) {
    if (applied.has(m.version)) {
      continue
    }
    const run = db.transaction(() => {
      db.exec(m.sql)
      db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(m.version)
    })
    run()
  }
}
