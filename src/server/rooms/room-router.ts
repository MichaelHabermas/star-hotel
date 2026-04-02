import { roomIdParamsSchema, roomListQuerySchema } from '@shared/schemas/room'
import { Router } from 'express'
import type { SqliteHttpAdapterKit } from '../http/sqlite-http-adapter-kit'
import { RoomRepository } from './room-repository'
import { RoomService } from './room-service'

export function createRoomRouter(kit: SqliteHttpAdapterKit): Router {
  const router = Router()
  const getRoomService = kit.createLazySqliteService((db) => new RoomService(new RoomRepository(db)))

  router.use(kit.ensurePersistenceReady)

  router.get(
    '/',
    kit.asyncHandler(async (req, res) => {
      const q = roomListQuerySchema.parse(req.query)
      const svc = await getRoomService()
      res.status(200).json(svc.list(q))
    }),
  )

  router.get(
    '/:id',
    kit.asyncHandler(async (req, res) => {
      const { id } = roomIdParamsSchema.parse(req.params)
      const svc = await getRoomService()
      res.status(200).json(svc.get(id))
    }),
  )

  return router
}
