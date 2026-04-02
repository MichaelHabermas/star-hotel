import Database from 'better-sqlite3'
import { afterEach, describe, expect, it } from 'vitest'
import { runMigrations } from '../db/run-migrations'
import { createSqlitePersistencePort } from '../persistence/sqlite-persistence'
import {
  DEV_FAKE_RESERVATION_COUNT,
  seedDevReservationsIfNeeded,
} from './seed-dev-reservations'

function openMigratedMemoryDb(): InstanceType<typeof Database> {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  runMigrations(db)
  return db
}

describe('seedDevReservationsIfNeeded', () => {
  let db: InstanceType<typeof Database>

  afterEach(() => {
    db.close()
  })

  it('inserts baseline rooms, guests, and the target reservation count once', () => {
    db = openMigratedMemoryDb()
    seedDevReservationsIfNeeded(db)

    const resCount = (db.prepare('SELECT COUNT(*) AS c FROM tbl_reservation').get() as { c: number })
      .c
    expect(resCount).toBe(DEV_FAKE_RESERVATION_COUNT)

    const roomCount = (db.prepare('SELECT COUNT(*) AS c FROM tbl_room').get() as { c: number }).c
    expect(roomCount).toBeGreaterThan(0)

    const guestCount = (db.prepare('SELECT COUNT(*) AS c FROM tbl_guest').get() as { c: number }).c
    expect(guestCount).toBeGreaterThan(0)
  })

  it('is idempotent when reservations already exist', () => {
    db = openMigratedMemoryDb()
    seedDevReservationsIfNeeded(db)
    seedDevReservationsIfNeeded(db)

    const resCount = (db.prepare('SELECT COUNT(*) AS c FROM tbl_reservation').get() as { c: number })
      .c
    expect(resCount).toBe(DEV_FAKE_RESERVATION_COUNT)
  })

  it('does not create overlapping stays for the same room (half-open intervals)', () => {
    db = openMigratedMemoryDb()
    seedDevReservationsIfNeeded(db)

    const overlapCount = (
      db
        .prepare(
          `SELECT COUNT(*) AS c
           FROM tbl_reservation a
           JOIN tbl_reservation b
             ON a.RoomID = b.RoomID
            AND a.ResID < b.ResID
            AND a.CheckInDate < b.CheckOutDate
            AND a.CheckOutDate > b.CheckInDate`,
        )
        .get() as { c: number }
    ).c
    expect(overlapCount).toBe(0)
  })
})

describe('createSqlitePersistencePort seedDevData', () => {
  it('runs dev seed after migrations when seedDevData is true', async () => {
    const p = createSqlitePersistencePort({ dbFilePath: ':memory:', seedDevData: true })
    await p.isReady()
    const db = p.getDatabase()
    const resCount = (db.prepare('SELECT COUNT(*) AS c FROM tbl_reservation').get() as { c: number })
      .c
    expect(resCount).toBe(DEV_FAKE_RESERVATION_COUNT)
    await p.close()
  })
})
