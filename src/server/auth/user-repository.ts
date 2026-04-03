import type DatabaseType from 'better-sqlite3';

type SqliteDatabase = InstanceType<typeof DatabaseType>;

export type UserRow = {
  UserID: number;
  Username: string;
  Password: string;
  Role: string;
};

export type UserPublicRow = {
  UserID: number;
  Username: string;
  Role: string;
};

export class UserRepository {
  constructor(private readonly db: SqliteDatabase) {}

  getByUsername(username: string): UserRow | undefined {
    return this.db
      .prepare(
        `SELECT UserID, Username, Password, Role FROM tbl_user WHERE Username = ? COLLATE NOCASE`,
      )
      .get(username) as UserRow | undefined;
  }

  getById(userId: number): UserRow | undefined {
    return this.db
      .prepare(`SELECT UserID, Username, Password, Role FROM tbl_user WHERE UserID = ?`)
      .get(userId) as UserRow | undefined;
  }

  listPublic(): UserPublicRow[] {
    return this.db
      .prepare(`SELECT UserID, Username, Role FROM tbl_user ORDER BY Username COLLATE NOCASE ASC`)
      .all() as UserPublicRow[];
  }

  insert(row: Omit<UserRow, 'UserID'>): number {
    const result = this.db
      .prepare(`INSERT INTO tbl_user (Username, Password, Role) VALUES (?, ?, ?)`)
      .run(row.Username, row.Password, row.Role);
    return Number(result.lastInsertRowid);
  }

  updatePublicFields(userId: number, fields: { Username: string; Role: string }): boolean {
    const r = this.db
      .prepare(`UPDATE tbl_user SET Username = ?, Role = ? WHERE UserID = ?`)
      .run(fields.Username, fields.Role, userId);
    return r.changes > 0;
  }

  updatePassword(userId: number, passwordHash: string): boolean {
    const r = this.db
      .prepare(`UPDATE tbl_user SET Password = ? WHERE UserID = ?`)
      .run(passwordHash, userId);
    return r.changes > 0;
  }

  deleteById(userId: number): boolean {
    const r = this.db.prepare(`DELETE FROM tbl_user WHERE UserID = ?`).run(userId);
    return r.changes > 0;
  }

  countUsers(): number {
    const row = this.db.prepare(`SELECT COUNT(*) AS c FROM tbl_user`).get() as { c: number };
    return row.c;
  }

  countByRole(role: string): number {
    const row = this.db
      .prepare(`SELECT COUNT(*) AS c FROM tbl_user WHERE lower(trim(Role)) = lower(trim(?))`)
      .get(role) as { c: number };
    return Number(row.c);
  }
}
