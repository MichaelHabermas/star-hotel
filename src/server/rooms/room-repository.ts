import type DatabaseType from 'better-sqlite3'
import type { RoomListQuery } from '@shared/schemas/room'

type SqliteDatabase = InstanceType<typeof DatabaseType>

export type RoomRow = {
  RoomID: number
  RoomType: string
  Price: number
  Status: string
}

export class RoomRepository {
  constructor(private readonly db: SqliteDatabase) {}

  list(query: RoomListQuery): RoomRow[] {
    if (query.status !== undefined) {
      return this.db
        .prepare(
          `SELECT RoomID, RoomType, Price, Status FROM tbl_room WHERE Status = ? ORDER BY RoomID ASC`,
        )
        .all(query.status) as RoomRow[]
    }
    return this.db
      .prepare(`SELECT RoomID, RoomType, Price, Status FROM tbl_room ORDER BY RoomID ASC`)
      .all() as RoomRow[]
  }

  getById(roomId: number): RoomRow | undefined {
    return this.db
      .prepare(`SELECT RoomID, RoomType, Price, Status FROM tbl_room WHERE RoomID = ?`)
      .get(roomId) as RoomRow | undefined
  }

  countReservationsForRoom(roomId: number): number {
    const row = this.db
      .prepare(`SELECT COUNT(*) AS c FROM tbl_reservation WHERE RoomID = ?`)
      .get(roomId) as { c: number }
    return row.c
  }

  insert(row: Omit<RoomRow, 'RoomID'>): number {
    const result = this.db
      .prepare(`INSERT INTO tbl_room (RoomType, Price, Status) VALUES (?, ?, ?)`)
      .run(row.RoomType, row.Price, row.Status)
    return Number(result.lastInsertRowid)
  }

  update(roomId: number, row: Omit<RoomRow, 'RoomID'>): void {
    this.db
      .prepare(`UPDATE tbl_room SET RoomType = ?, Price = ?, Status = ? WHERE RoomID = ?`)
      .run(row.RoomType, row.Price, row.Status, roomId)
  }

  delete(roomId: number): boolean {
    const result = this.db.prepare(`DELETE FROM tbl_room WHERE RoomID = ?`).run(roomId)
    return result.changes > 0
  }
}
