import {
  reservationCreateBodySchema,
  reservationIdParamsSchema,
  reservationListQuerySchema,
  reservationUpdateBodySchema,
} from '@shared/schemas/reservation'
import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import type { HotelSqlitePersistencePort } from '../ports/hotel-sqlite-persistence-port'
import { ReservationRepository } from './reservation-repository'
import { ReservationService } from './reservation-service'

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    void fn(req, res, next).catch(next)
  }
}

export function createReservationRouter(persistence: HotelSqlitePersistencePort): Router {
  const router = Router()

  let serviceInit: Promise<ReservationService> | null = null
  function getReservationService(): Promise<ReservationService> {
    if (!serviceInit) {
      serviceInit = (async () => {
        await persistence.isReady()
        return new ReservationService(new ReservationRepository(persistence.getDatabase()))
      })()
    }
    return serviceInit
  }

  router.use(async (_req, _res, next) => {
    try {
      await getReservationService()
      next()
    } catch (err) {
      next(err)
    }
  })

  router.get(
    '/',
    asyncHandler(async (req, res, next) => {
      try {
        const q = reservationListQuerySchema.parse(req.query)
        const svc = await getReservationService()
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
        const { id } = reservationIdParamsSchema.parse(req.params)
        const svc = await getReservationService()
        res.status(200).json(svc.get(id))
      } catch (err) {
        next(err)
      }
    }),
  )

  router.post(
    '/',
    asyncHandler(async (req, res, next) => {
      try {
        const body = reservationCreateBodySchema.parse(req.body)
        const svc = await getReservationService()
        res.status(201).json(svc.create(body))
      } catch (err) {
        next(err)
      }
    }),
  )

  router.patch(
    '/:id',
    asyncHandler(async (req, res, next) => {
      try {
        const { id } = reservationIdParamsSchema.parse(req.params)
        const body = reservationUpdateBodySchema.parse(req.body)
        const svc = await getReservationService()
        res.status(200).json(svc.update(id, body))
      } catch (err) {
        next(err)
      }
    }),
  )

  router.delete(
    '/:id',
    asyncHandler(async (req, res, next) => {
      try {
        const { id } = reservationIdParamsSchema.parse(req.params)
        const svc = await getReservationService()
        svc.delete(id)
        res.status(204).send()
      } catch (err) {
        next(err)
      }
    }),
  )

  return router
}
