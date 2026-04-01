import { roomIdParamsSchema, roomListQuerySchema } from '@shared/schemas/room'
import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import type { SqlitePersistencePort } from '../persistence/sqlite-persistence'
import { RoomNotFoundError } from '../reservations/reservation-errors'
import { RoomRepository } from './room-repository'

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    void fn(req, res, next).catch(next)
  }
}

function rowToJson(row: { RoomID: number; RoomType: string; Price: number; Status: string }) {
  return {
    id: row.RoomID,
    roomType: row.RoomType,
    price: row.Price,
    status: row.Status,
  }
}

export function createRoomRouter(persistence: SqlitePersistencePort): Router {
  const router = Router()

  router.use(async (req, res, next) => {
    try {
      await persistence.isReady()
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
        const repo = new RoomRepository(persistence.getDatabase())
        res.status(200).json(repo.list(q).map(rowToJson))
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
        const repo = new RoomRepository(persistence.getDatabase())
        const row = repo.getById(id)
        if (row === undefined) {
          throw new RoomNotFoundError(id)
        }
        res.status(200).json(rowToJson(row))
      } catch (err) {
        next(err)
      }
    }),
  )

  return router
}
