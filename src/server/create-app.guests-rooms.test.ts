import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createServerApp } from './create-app';
import {
  createSqlitePersistencePort,
  type SqlitePersistencePort,
} from './persistence/sqlite-persistence';
import { registerMvpSqliteApiRoutes } from './register-mvp-sqlite-api-routes';

type SqliteDb = ReturnType<SqlitePersistencePort['getDatabase']>;

function seedSampleData(db: SqliteDb): { roomId: number; guestId: number } {
  const room = db
    .prepare(`INSERT INTO tbl_room (RoomType, Price, Status) VALUES ('Deluxe', 150, 'Available')`)
    .run();
  const guest = db
    .prepare(
      `INSERT INTO tbl_guest (Name, ID_Number, Contact) VALUES ('Test Guest', 'ID-1', 'x@y.z')`,
    )
    .run();
  return { roomId: Number(room.lastInsertRowid), guestId: Number(guest.lastInsertRowid) };
}

function createTestApp(persistence: SqlitePersistencePort) {
  return createServerApp({
    persistence,
    registerApiRoutes: (expressApp) => {
      registerMvpSqliteApiRoutes(expressApp, persistence);
    },
  });
}

describe('createServerApp — guests, rooms, OpenAPI', () => {
  let persistence: SqlitePersistencePort;

  afterEach(async () => {
    await persistence.close();
  });

  it('lists guests and rooms; filters rooms by status; returns OpenAPI JSON', async () => {
    persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' });
    await persistence.isReady();
    const { roomId, guestId } = seedSampleData(persistence.getDatabase());

    const app = createTestApp(persistence);

    const openApiRes = await request(app).get(EMBEDDED_API_PATHS.openapiJson).expect(200);
    expect(openApiRes.body).toMatchObject({
      openapi: '3.0.3',
      info: { title: 'Star Hotel embedded API' },
    });

    const guestsRes = await request(app).get('/api/guests').expect(200);
    expect(guestsRes.body).toHaveLength(1);
    expect(guestsRes.body[0]).toMatchObject({
      id: guestId,
      name: 'Test Guest',
      idNumber: 'ID-1',
      contact: 'x@y.z',
    });

    await request(app)
      .get(`/api/guests/${guestId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(guestId);
      });

    await request(app)
      .get('/api/guests/99999')
      .expect(404)
      .expect((res) => {
        expect(res.body.error.code).toBe('GUEST_NOT_FOUND');
      });

    const roomsRes = await request(app).get('/api/rooms').expect(200);
    expect(roomsRes.body).toHaveLength(1);
    expect(roomsRes.body[0]).toMatchObject({
      id: roomId,
      roomType: 'Deluxe',
      price: 150,
      status: 'Available',
    });

    const filtered = await request(app).get('/api/rooms?status=Available').expect(200);
    expect(filtered.body).toHaveLength(1);

    const emptyFilter = await request(app).get('/api/rooms?status=Occupied').expect(200);
    expect(emptyFilter.body).toHaveLength(0);

    await request(app).get(`/api/rooms/${roomId}`).expect(200);

    await request(app)
      .get('/api/rooms/99999')
      .expect(404)
      .expect((res) => {
        expect(res.body.error.code).toBe('ROOM_NOT_FOUND');
      });

    await request(app).get('/api/guests?unexpected=1').expect(400);

    const createdRoom = await request(app)
      .post('/api/rooms')
      .send({ roomType: 'Penthouse', price: 300, status: 'Available' })
      .expect(201);
    const newRoomId = createdRoom.body.id as number;
    expect(newRoomId).toBeGreaterThan(0);

    await request(app)
      .patch(`/api/rooms/${newRoomId}`)
      .send({ price: 310 })
      .expect(200)
      .expect((res) => {
        expect(res.body.price).toBe(310);
      });

    const createdGuest = await request(app)
      .post('/api/guests')
      .send({ name: 'API Guest', idNumber: 'X1', contact: 'a@b.c' })
      .expect(201);
    const newGuestId = createdGuest.body.id as number;

    await request(app)
      .patch(`/api/guests/${newGuestId}`)
      .send({ contact: 'z@b.c' })
      .expect(200)
      .expect((res) => {
        expect(res.body.contact).toBe('z@b.c');
      });

    await request(app).delete(`/api/rooms/${newRoomId}`).expect(204);
    await request(app).delete(`/api/guests/${newGuestId}`).expect(204);
  });
});
