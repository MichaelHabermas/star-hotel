import Database from 'better-sqlite3'
import { describe, expect, it } from 'vitest'
import { DbConstraintError, mapSqliteConstraintError } from './db-errors'
import { runMigrations } from './run-migrations'

describe('mapSqliteConstraintError', () => {
  it('maps SQLITE_CONSTRAINT_FOREIGNKEY to DbConstraintError', () => {
    const db = new Database(':memory:')
    db.pragma('foreign_keys = ON')
    runMigrations(db)

    const guest = db
      .prepare('INSERT INTO tbl_guest (Name, ID_Number, Contact) VALUES (?, ?, ?)')
      .run('Test Guest', null, null)

    expect(() => {
      try {
        db.prepare(
          'INSERT INTO tbl_reservation (RoomID, GuestID, CheckInDate, CheckOutDate, TotalAmount) VALUES (?, ?, ?, ?, ?)',
        ).run(999, Number(guest.lastInsertRowid), '2026-01-01', '2026-01-02', 100)
      } catch (e) {
        throw mapSqliteConstraintError(e)
      }
    }).toThrow(DbConstraintError)

    try {
      db.prepare(
        'INSERT INTO tbl_reservation (RoomID, GuestID, CheckInDate, CheckOutDate, TotalAmount) VALUES (?, ?, ?, ?, ?)',
      ).run(999, Number(guest.lastInsertRowid), '2026-01-01', '2026-01-02', 100)
    } catch (e) {
      const mapped = mapSqliteConstraintError(e)
      expect(mapped).toBeInstanceOf(DbConstraintError)
      expect(mapped.kind).toBe('FOREIGN_KEY')
      expect(mapped.sqliteCode).toBe('SQLITE_CONSTRAINT_FOREIGNKEY')
    }
  })

  it('rethrows non-constraint errors', () => {
    expect(() => mapSqliteConstraintError(new Error('boom'))).toThrow('boom')
  })
})
