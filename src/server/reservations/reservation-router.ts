import {
  reservationCreateBodySchema,
  reservationIdParamsSchema,
  reservationListQuerySchema,
  reservationUpdateBodySchema,
} from '@shared/schemas/reservation'
import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import type { SqlitePersistencePort } from '../persistence/sqlite-persistence'
import { ReservationRepository } from './reservation-repository'
import { ReservationService } from './reservation-service'

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    void fn(req, res, next).catch(next)
  }
}

function serviceFor(persistence: SqlitePersistencePort): ReservationService {
  const db = persistence.getDatabase()
  return new ReservationService(new ReservationRepository(db))
}

export function createReservationRouter(persistence: SqlitePersistencePort): Router {
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
        const q = reservationListQuerySchema.parse(req.query)
        const svc = serviceFor(persistence)
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
        const svc = serviceFor(persistence)
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
        const svc = serviceFor(persistence)
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
        const svc = serviceFor(persistence)
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
        const svc = serviceFor(persistence)
        svc.delete(id)
        res.status(204).send()
      } catch (err) {
        next(err)
      }
    }),
  )

  return router
}
