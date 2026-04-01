import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'
import { createServerApp } from './create-app'
import {
  createSqlitePersistencePort,
  type SqlitePersistencePort,
} from './persistence/sqlite-persistence'

type SqliteDb = ReturnType<SqlitePersistencePort['getDatabase']>

function seedRoomAndGuest(db: SqliteDb): { roomId: number; guestId: number } {
  const room = db
    .prepare(`INSERT INTO tbl_room (RoomType, Price, Status) VALUES ('Standard', 100, 'Available')`)
    .run()
  const guest = db
    .prepare(`INSERT INTO tbl_guest (Name, ID_Number, Contact) VALUES ('Ada Lovelace', null, null)`)
    .run()
  return { roomId: Number(room.lastInsertRowid), guestId: Number(guest.lastInsertRowid) }
}

describe('createServerApp — reservations API', () => {
  let persistence: SqlitePersistencePort

  afterEach(async () => {
    await persistence.close()
  })

  it('runs full CRUD with Zod validation and overlap conflict', async () => {
    persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' })
    await persistence.isReady()
    const { roomId, guestId } = seedRoomAndGuest(persistence.getDatabase())

    const app = createServerApp({ persistence })

    const createRes = await request(app)
      .post('/api/reservations')
      .send({
        roomId,
        guestId,
        checkInDate: '2026-06-01',
        checkOutDate: '2026-06-04',
      })
      .expect(201)

    expect(createRes.body).toMatchObject({
      roomId,
      guestId,
      checkInDate: '2026-06-01',
      checkOutDate: '2026-06-04',
      totalAmount: 300,
    })

    const id = createRes.body.id as number

    const listRes = await request(app).get('/api/reservations').expect(200)
    expect(listRes.body).toHaveLength(1)

    await request(app)
      .get(`/api/reservations/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(id)
      })

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
        expect(res.body.error.code).toBe('RESERVATION_OVERLAP')
      })

    await request(app)
      .post('/api/reservations')
      .send({ roomId: 99999, guestId, checkInDate: '2026-07-01', checkOutDate: '2026-07-02' })
      .expect(404)
      .expect((res) => {
        expect(res.body.error.code).toBe('ROOM_NOT_FOUND')
      })

    await request(app)
      .post('/api/reservations')
      .send({ roomId, guestId: 99999, checkInDate: '2026-07-01', checkOutDate: '2026-07-02' })
      .expect(404)
      .expect((res) => {
        expect(res.body.error.code).toBe('GUEST_NOT_FOUND')
      })

    await request(app)
      .post('/api/reservations')
      .send({ roomId, guestId, checkInDate: '2026-06-10', checkOutDate: '2026-06-09' })
      .expect(400)

    await request(app).patch(`/api/reservations/${id}`).send({ guestId }).expect(200)

    await request(app).delete(`/api/reservations/${id}`).expect(204)

    await request(app).get(`/api/reservations/${id}`).expect(404)
  })
})
