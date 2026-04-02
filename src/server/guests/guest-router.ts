import { guestIdParamsSchema, guestListQuerySchema } from '@shared/schemas/guest'
import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import type { HotelSqlitePersistencePort } from '../ports/hotel-sqlite-persistence-port'
import { GuestRepository } from './guest-repository'
import { GuestService } from './guest-service'

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    void fn(req, res, next).catch(next)
  }
}

export function createGuestRouter(persistence: HotelSqlitePersistencePort): Router {
  const router = Router()

  let serviceInit: Promise<GuestService> | null = null
  function getGuestService(): Promise<GuestService> {
    if (!serviceInit) {
      serviceInit = (async () => {
        await persistence.isReady()
        return new GuestService(new GuestRepository(persistence.getDatabase()))
      })()
    }
    return serviceInit
  }

  router.use(async (_req, _res, next) => {
    try {
      await getGuestService()
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
        const svc = await getGuestService()
        res.status(200).json(svc.list())
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
        const svc = await getGuestService()
        res.status(200).json(svc.get(id))
      } catch (err) {
        next(err)
      }
    }),
  )

  return router
}
