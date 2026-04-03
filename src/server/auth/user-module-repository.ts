import { HOTEL_MODULE_KEYS, type HotelModuleKey } from '@shared/hotel-modules';
import type DatabaseType from 'better-sqlite3';

type SqliteDatabase = InstanceType<typeof DatabaseType>;

export class UserModuleRepository {
  constructor(private readonly db: SqliteDatabase) {}

  listExplicitKeys(userId: number): HotelModuleKey[] {
    const rows = this.db
      .prepare(
        `SELECT ModuleKey FROM tbl_user_module_access WHERE UserID = ? ORDER BY ModuleKey ASC`,
      )
      .all(userId) as { ModuleKey: string }[];
    const out: HotelModuleKey[] = [];
    for (const r of rows) {
      if ((HOTEL_MODULE_KEYS as readonly string[]).includes(r.ModuleKey)) {
        out.push(r.ModuleKey as HotelModuleKey);
      }
    }
    return out;
  }

  resolveForUser(userId: number): HotelModuleKey[] {
    const rows = this.db
      .prepare(
        `SELECT ModuleKey FROM tbl_user_module_access WHERE UserID = ? ORDER BY ModuleKey ASC`,
      )
      .all(userId) as { ModuleKey: string }[];
    if (rows.length === 0) {
      return [...HOTEL_MODULE_KEYS];
    }
    const allowed = new Set<string>();
    for (const r of rows) {
      allowed.add(r.ModuleKey);
    }
    return HOTEL_MODULE_KEYS.filter((k) => allowed.has(k));
  }

  replaceForUser(userId: number, keys: readonly HotelModuleKey[]): void {
    const del = this.db.prepare(`DELETE FROM tbl_user_module_access WHERE UserID = ?`);
    const ins = this.db.prepare(
      `INSERT INTO tbl_user_module_access (UserID, ModuleKey) VALUES (?, ?)`,
    );
    const run = this.db.transaction(() => {
      del.run(userId);
      for (const k of keys) {
        ins.run(userId, k);
      }
    });
    run();
  }
}
