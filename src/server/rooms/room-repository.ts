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
}
