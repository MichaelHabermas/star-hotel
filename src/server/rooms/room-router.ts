import { roomIdParamsSchema, roomListQuerySchema } from '@shared/schemas/room'
import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import type { HotelSqlitePersistencePort } from '../ports/hotel-sqlite-persistence-port'
import { RoomRepository } from './room-repository'
import { RoomService } from './room-service'

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    void fn(req, res, next).catch(next)
  }
}

export function createRoomRouter(persistence: HotelSqlitePersistencePort): Router {
  const router = Router()

  let serviceInit: Promise<RoomService> | null = null
  function getRoomService(): Promise<RoomService> {
    if (!serviceInit) {
      serviceInit = (async () => {
        await persistence.isReady()
        return new RoomService(new RoomRepository(persistence.getDatabase()))
      })()
    }
    return serviceInit
  }

  router.use(async (_req, _res, next) => {
    try {
      await getRoomService()
      next()
    } catch (err) {
      next(err)
    }
  })

  router.get(
    '/',
    asyncHandler(async (req, res, next) => {
      try {
        const q = roomListQuerySchema.parse(req.query)
        const svc = await getRoomService()
        res.status(200).json(svc.list(q))
      } catch (err) {
        next(err)
      }
    }),
  )

  router.get(
    '/:id',
    asyncHandler(async (req, res, next) => {
      try {
        const { id } = roomIdParamsSchema.parse(req.params)
        const svc = await getRoomService()
        res.status(200).json(svc.get(id))
      } catch (err) {
        next(err)
      }
    }),
  )

  return router
}
