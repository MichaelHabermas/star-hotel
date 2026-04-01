import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'
import { createServerApp } from './create-app'
import {
  createSqlitePersistencePort,
  type SqlitePersistencePort,
} from './persistence/sqlite-persistence'
import { registerSqliteGuestRoutes } from './guests/register-sqlite-guest-routes'
import { registerSqliteRoomRoutes } from './rooms/register-sqlite-room-routes'
import { registerSqliteReservationRoutes } from './reservations/register-sqlite-reservation-routes'

type SqliteDb = ReturnType<SqlitePersistencePort['getDatabase']>

function seedSampleData(db: SqliteDb): { roomId: number; guestId: number } {
  const room = db
    .prepare(
      `INSERT INTO tbl_room (RoomType, Price, Status) VALUES ('Deluxe', 150, 'Available')`,
    )
    .run()
  const guest = db
    .prepare(`INSERT INTO tbl_guest (Name, ID_Number, Contact) VALUES ('Test Guest', 'ID-1', 'x@y.z')`)
    .run()
  return { roomId: Number(room.lastInsertRowid), guestId: Number(guest.lastInsertRowid) }
}

function createTestApp(persistence: SqlitePersistencePort) {
  return createServerApp({
    persistence,
    registerApiRoutes: (expressApp) => {
      registerSqliteGuestRoutes(expressApp, persistence)
      registerSqliteRoomRoutes(expressApp, persistence)
      registerSqliteReservationRoutes(expressApp, persistence)
    },
  })
}

describe('createServerApp — guests, rooms, OpenAPI', () => {
  let persistence: SqlitePersistencePort

  afterEach(async () => {
    await persistence.close()
  })

  it('lists guests and rooms; filters rooms by status; returns OpenAPI JSON', async () => {
    persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' })
    await persistence.isReady()
    const { roomId, guestId } = seedSampleData(persistence.getDatabase())

    const app = createTestApp(persistence)

    const openApiRes = await request(app).get('/api/openapi.json').expect(200)
    expect(openApiRes.body).toMatchObject({ openapi: '3.0.3', info: { title: 'Star Hotel embedded API' } })

    const guestsRes = await request(app).get('/api/guests').expect(200)
    expect(guestsRes.body).toHaveLength(1)
    expect(guestsRes.body[0]).toMatchObject({
      id: guestId,
      name: 'Test Guest',
      idNumber: 'ID-1',
      contact: 'x@y.z',
    })

    await request(app).get(`/api/guests/${guestId}`).expect(200).expect((res) => {
      expect(res.body.id).toBe(guestId)
    })

    await request(app).get('/api/guests/99999').expect(404).expect((res) => {
      expect(res.body.error.code).toBe('GUEST_NOT_FOUND')
    })

    const roomsRes = await request(app).get('/api/rooms').expect(200)
    expect(roomsRes.body).toHaveLength(1)
    expect(roomsRes.body[0]).toMatchObject({
      id: roomId,
      roomType: 'Deluxe',
      price: 150,
      status: 'Available',
    })

    const filtered = await request(app).get('/api/rooms?status=Available').expect(200)
    expect(filtered.body).toHaveLength(1)

    const emptyFilter = await request(app).get('/api/rooms?status=Occupied').expect(200)
    expect(emptyFilter.body).toHaveLength(0)

    await request(app).get(`/api/rooms/${roomId}`).expect(200)

    await request(app).get('/api/rooms/99999').expect(404).expect((res) => {
      expect(res.body.error.code).toBe('ROOM_NOT_FOUND')
    })

    await request(app).get('/api/guests?unexpected=1').expect(400)
  })
})
