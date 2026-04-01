import type DatabaseType from 'better-sqlite3'

type SqliteDatabase = InstanceType<typeof DatabaseType>

export type GuestRow = {
  GuestID: number
  Name: string
  ID_Number: string | null
  Contact: string | null
}

export class GuestRepository {
  constructor(private readonly db: SqliteDatabase) {}

  list(): GuestRow[] {
    return this.db
      .prepare(
        `SELECT GuestID, Name, ID_Number, Contact FROM tbl_guest ORDER BY Name COLLATE NOCASE ASC`,
      )
      .all() as GuestRow[]
  }

  getById(guestId: number): GuestRow | undefined {
    return this.db
      .prepare(`SELECT GuestID, Name, ID_Number, Contact FROM tbl_guest WHERE GuestID = ?`)
      .get(guestId) as GuestRow | undefined
  }
}
