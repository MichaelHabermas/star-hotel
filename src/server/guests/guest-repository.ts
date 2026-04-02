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

  countReservationsForGuest(guestId: number): number {
    const row = this.db
      .prepare(`SELECT COUNT(*) AS c FROM tbl_reservation WHERE GuestID = ?`)
      .get(guestId) as { c: number }
    return row.c
  }

  insert(row: Omit<GuestRow, 'GuestID'>): number {
    const result = this.db
      .prepare(`INSERT INTO tbl_guest (Name, ID_Number, Contact) VALUES (?, ?, ?)`)
      .run(row.Name, row.ID_Number, row.Contact)
    return Number(result.lastInsertRowid)
  }

  update(guestId: number, row: Omit<GuestRow, 'GuestID'>): void {
    this.db
      .prepare(`UPDATE tbl_guest SET Name = ?, ID_Number = ?, Contact = ? WHERE GuestID = ?`)
      .run(row.Name, row.ID_Number, row.Contact, guestId)
  }

  delete(guestId: number): boolean {
    const result = this.db.prepare(`DELETE FROM tbl_guest WHERE GuestID = ?`).run(guestId)
    return result.changes > 0
  }
}
