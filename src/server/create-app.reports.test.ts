import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createServerApp } from './create-app';
import { createSqliteHttpAdapterKit } from './http/sqlite-http-adapter-kit';
import {
  createSqlitePersistencePort,
  type SqlitePersistencePort,
} from './persistence/sqlite-persistence';
import { createReportRouter } from './reports/report-router';

type SqliteDb = ReturnType<SqlitePersistencePort['getDatabase']>;

function seedRoomGuestReservation(db: SqliteDb): {
  roomId: number;
  guestId: number;
  resId: number;
} {
  const room = db
    .prepare(`INSERT INTO tbl_room (RoomType, Price, Status) VALUES ('Standard', 100, 'Occupied')`)
    .run();
  const guest = db
    .prepare(`INSERT INTO tbl_guest (Name, ID_Number, Contact) VALUES ('Test Guest', 'ID1', '555')`)
    .run();
  const roomId = Number(room.lastInsertRowid);
  const guestId = Number(guest.lastInsertRowid);
  const res = db
    .prepare(
      `INSERT INTO tbl_reservation (RoomID, GuestID, CheckInDate, CheckOutDate, TotalAmount)
       VALUES (?, ?, '2026-06-01', '2026-06-04', 300)`,
    )
    .run(roomId, guestId);
  return { roomId, guestId, resId: Number(res.lastInsertRowid) };
}

describe('createServerApp — reports API (E9)', () => {
  let persistence: SqlitePersistencePort;

  afterEach(async () => {
    await persistence.close();
  });

  it('returns folio JSON for a reservation and 404 when missing', async () => {
    persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' });
    await persistence.isReady();
    const { resId } = seedRoomGuestReservation(persistence.getDatabase());

    const kit = createSqliteHttpAdapterKit(persistence);
    const app = await createServerApp({
      persistence,
      registerApiRoutes: (expressApp) => {
        expressApp.use('/api/reports', createReportRouter(kit));
      },
    });

    const ok = await request(app)
      .get('/api/reports/folio')
      .query({ reservationId: resId })
      .expect(200);

    expect(ok.body).toMatchObject({
      reservation: {
        id: resId,
        checkInDate: '2026-06-01',
        checkOutDate: '2026-06-04',
        nights: 3,
        totalAmount: 300,
      },
      guest: { name: 'Test Guest' },
      room: { roomType: 'Standard' },
    });
    expect(typeof ok.body.generatedAt).toBe('string');

    await request(app).get('/api/reports/folio').query({ reservationId: 99999 }).expect(404);
  });

  it('returns day sheet lines for stays active on a date', async () => {
    persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' });
    await persistence.isReady();
    const { resId, roomId } = seedRoomGuestReservation(persistence.getDatabase());

    const kit = createSqliteHttpAdapterKit(persistence);
    const app = await createServerApp({
      persistence,
      registerApiRoutes: (expressApp) => {
        expressApp.use('/api/reports', createReportRouter(kit));
      },
    });

    const mid = await request(app)
      .get('/api/reports/day-sheet')
      .query({ date: '2026-06-02' })
      .expect(200);

    expect(mid.body.date).toBe('2026-06-02');
    expect(mid.body.totalRooms).toBe(1);
    expect(mid.body.occupancyCount).toBe(1);
    expect(mid.body.lines).toHaveLength(1);
    expect(mid.body.lines[0]).toMatchObject({
      reservationId: resId,
      roomId,
      guestName: 'Test Guest',
    });

    const before = await request(app)
      .get('/api/reports/day-sheet')
      .query({ date: '2026-05-31' })
      .expect(200);
    expect(before.body.occupancyCount).toBe(0);
    expect(before.body.lines).toHaveLength(0);
  });
});
