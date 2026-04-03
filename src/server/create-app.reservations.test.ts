import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { computeStayPricing } from '../domain/reservation-pricing';
import { createServerApp } from './create-app';
import { createSqliteHttpAdapterKit } from './http/sqlite-http-adapter-kit';
import {
  createSqlitePersistencePort,
  type SqlitePersistencePort,
} from './persistence/sqlite-persistence';
import { createReservationRouter } from './reservations/reservation-router';

type SqliteDb = ReturnType<SqlitePersistencePort['getDatabase']>;

function seedRoomAndGuest(db: SqliteDb): { roomId: number; guestId: number } {
  const room = db
    .prepare(
      `INSERT INTO tbl_room (RoomNumber, RoomType, Price, Status) VALUES ('601', 'Standard', 100, 'Open')`,
    )
    .run();
  const guest = db
    .prepare(`INSERT INTO tbl_guest (Name, ID_Number, Contact) VALUES ('Ada Lovelace', null, null)`)
    .run();
  return { roomId: Number(room.lastInsertRowid), guestId: Number(guest.lastInsertRowid) };
}

describe('createServerApp — reservations API', () => {
  let persistence: SqlitePersistencePort;

  afterEach(async () => {
    await persistence.close();
  });

  it('runs full CRUD with Zod validation and overlap conflict', async () => {
    persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' });
    await persistence.isReady();
    const { roomId, guestId } = seedRoomAndGuest(persistence.getDatabase());

    const kit = createSqliteHttpAdapterKit(persistence);
    const app = await createServerApp({
      persistence,
      registerApiRoutes: (expressApp) => {
        expressApp.use('/api/reservations', createReservationRouter(kit));
      },
    });

    const createRes = await request(app)
      .post('/api/reservations')
      .send({
        roomId,
        guestId,
        checkInDate: '2026-06-01',
        checkOutDate: '2026-06-04',
      })
      .expect(201);

    const expectedTotal = computeStayPricing('2026-06-01', '2026-06-04', 100).total;
    expect(createRes.body).toMatchObject({
      roomId,
      guestId,
      checkInDate: '2026-06-01',
      checkOutDate: '2026-06-04',
      totalAmount: expectedTotal,
    });

    const id = createRes.body.id as number;

    const listRes = await request(app).get('/api/reservations').expect(200);
    expect(listRes.body).toHaveLength(1);

    await request(app)
      .get(`/api/reservations/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(id);
      });

    await request(app)
      .post('/api/reservations')
      .send({
        roomId,
        guestId,
        checkInDate: '2026-06-02',
        checkOutDate: '2026-06-03',
      })
      .expect(409)
      .expect((res) => {
        expect(res.body.error.code).toBe('RESERVATION_OVERLAP');
      });

    const other = await request(app)
      .post('/api/reservations')
      .send({
        roomId,
        guestId,
        checkInDate: '2026-07-01',
        checkOutDate: '2026-07-05',
      })
      .expect(201);
    const otherId = other.body.id as number;

    await request(app)
      .patch(`/api/reservations/${otherId}`)
      .send({ checkInDate: '2026-06-02', checkOutDate: '2026-06-03' })
      .expect(409)
      .expect((res) => {
        expect(res.body.error.code).toBe('RESERVATION_OVERLAP');
      });

    await request(app)
      .post('/api/reservations')
      .send({ roomId: 99999, guestId, checkInDate: '2026-07-01', checkOutDate: '2026-07-02' })
      .expect(404)
      .expect((res) => {
        expect(res.body.error.code).toBe('ROOM_NOT_FOUND');
      });

    await request(app)
      .post('/api/reservations')
      .send({ roomId, guestId: 99999, checkInDate: '2026-07-01', checkOutDate: '2026-07-02' })
      .expect(404)
      .expect((res) => {
        expect(res.body.error.code).toBe('GUEST_NOT_FOUND');
      });

    await request(app)
      .post('/api/reservations')
      .send({ roomId, guestId, checkInDate: '2026-06-10', checkOutDate: '2026-06-09' })
      .expect(400);

    await request(app).patch(`/api/reservations/${id}`).send({ guestId }).expect(200);

    await request(app).delete(`/api/reservations/${id}`).expect(204);

    await request(app).get(`/api/reservations/${id}`).expect(404);
  });
});
