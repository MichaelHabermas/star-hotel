import type DatabaseType from 'better-sqlite3';

type SqliteDatabase = InstanceType<typeof DatabaseType>;

export type UserRow = {
  UserID: number;
  Username: string;
  Password: string;
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

  insert(row: Omit<UserRow, 'UserID'>): number {
    const result = this.db
      .prepare(`INSERT INTO tbl_user (Username, Password, Role) VALUES (?, ?, ?)`)
      .run(row.Username, row.Password, row.Role);
    return Number(result.lastInsertRowid);
  }

  countUsers(): number {
    const row = this.db.prepare(`SELECT COUNT(*) AS c FROM tbl_user`).get() as { c: number };
    return row.c;
  }
}
