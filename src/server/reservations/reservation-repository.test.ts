import { afterEach, describe, expect, it } from 'vitest';
import type { SqlitePersistencePort } from '../persistence/sqlite-persistence';
import { createSqlitePersistencePort } from '../persistence/sqlite-persistence';
import { ReservationRepository } from './reservation-repository';

function seedRoomAndGuest(db: ReturnType<SqlitePersistencePort['getDatabase']>): {
  roomId: number;
  guestId: number;
} {
  const room = db
    .prepare(`INSERT INTO tbl_room (RoomType, Price, Status) VALUES ('Standard', 100, 'Available')`)
    .run();
  const guest = db
    .prepare(`INSERT INTO tbl_guest (Name, ID_Number, Contact) VALUES ('Ada', null, null)`)
    .run();
  return { roomId: Number(room.lastInsertRowid), guestId: Number(guest.lastInsertRowid) };
}

describe('ReservationRepository — overlap query', () => {
  let persistence: SqlitePersistencePort;

  afterEach(async () => {
    await persistence.close();
  });

  it('findOverlappingReservation returns ResID when ranges overlap (half-open)', async () => {
    persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' });
    await persistence.isReady();
    const db = persistence.getDatabase();
    const { roomId, guestId } = seedRoomAndGuest(db);
    db.prepare(
      `INSERT INTO tbl_reservation (RoomID, GuestID, CheckInDate, CheckOutDate, TotalAmount)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(roomId, guestId, '2026-06-01', '2026-06-05', 400);

    const repo = new ReservationRepository(db);
    expect(repo.findOverlappingReservation(roomId, '2026-06-04', '2026-06-06')).toBe(1);
  });

  it('findOverlappingReservation returns undefined when ranges only touch at boundary', async () => {
    persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' });
    await persistence.isReady();
    const db = persistence.getDatabase();
    const { roomId, guestId } = seedRoomAndGuest(db);
    db.prepare(
      `INSERT INTO tbl_reservation (RoomID, GuestID, CheckInDate, CheckOutDate, TotalAmount)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(roomId, guestId, '2026-06-01', '2026-06-04', 300);

    const repo = new ReservationRepository(db);
    expect(repo.findOverlappingReservation(roomId, '2026-06-04', '2026-06-06')).toBeUndefined();
  });

  it('findOverlappingReservation respects excludeResId', async () => {
    persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' });
    await persistence.isReady();
    const db = persistence.getDatabase();
    const { roomId, guestId } = seedRoomAndGuest(db);
    db.prepare(
      `INSERT INTO tbl_reservation (RoomID, GuestID, CheckInDate, CheckOutDate, TotalAmount)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(roomId, guestId, '2026-06-01', '2026-06-05', 400);

    const repo = new ReservationRepository(db);
    expect(repo.findOverlappingReservation(roomId, '2026-06-02', '2026-06-04', 1)).toBeUndefined();
  });
});
