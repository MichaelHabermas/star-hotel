import type DatabaseType from 'better-sqlite3';

type SqliteDatabase = InstanceType<typeof DatabaseType>;

/** Argon2id hash for password `changeme` (see README — change after first login in production). */
const DEFAULT_ADMIN_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$0o55Pbduj+dg+Ihus/NwZw$pzQLToMpmMtYnU4al/Oy9KsfIwt09/j0bmcwZkhfzJs';

/**
 * Ensures at least one operator exists after migrations (T4 clean install).
 * Idempotent: skips when `tbl_user` is non-empty.
 */
export function seedDefaultUserIfNeeded(db: SqliteDatabase): void {
  const row = db.prepare(`SELECT COUNT(*) AS c FROM tbl_user`).get() as { c: number };
  if (row.c > 0) {
    return;
  }
  db.prepare(`INSERT INTO tbl_user (Username, Password, Role) VALUES (?, ?, ?)`).run(
    'admin',
    DEFAULT_ADMIN_PASSWORD_HASH,
    'Admin',
  );
}
