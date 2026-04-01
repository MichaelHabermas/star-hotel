import { guestIdParamsSchema, guestListQuerySchema } from '@shared/schemas/guest'
import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import type { SqlitePersistencePort } from '../persistence/sqlite-persistence'
import { GuestNotFoundError } from '../reservations/reservation-errors'
import { GuestRepository } from './guest-repository'

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    void fn(req, res, next).catch(next)
  }
}

function rowToJson(row: { GuestID: number; Name: string; ID_Number: string | null; Contact: string | null }) {
  return {
    id: row.GuestID,
    name: row.Name,
    idNumber: row.ID_Number,
    contact: row.Contact,
  }
}

export function createGuestRouter(persistence: SqlitePersistencePort): Router {
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
        guestListQuerySchema.parse(req.query)
        const repo = new GuestRepository(persistence.getDatabase())
        res.status(200).json(repo.list().map(rowToJson))
      } catch (err) {
        next(err)
      }
    }),
  )

  router.get(
    '/:id',
    asyncHandler(async (req, res, next) => {
      try {
        const { id } = guestIdParamsSchema.parse(req.params)
        const repo = new GuestRepository(persistence.getDatabase())
        const row = repo.getById(id)
        if (row === undefined) {
          throw new GuestNotFoundError(id)
        }
        res.status(200).json(rowToJson(row))
      } catch (err) {
        next(err)
      }
    }),
  )

  return router
}
