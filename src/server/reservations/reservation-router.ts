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

export function createReservationRouter(persistence: SqlitePersistencePort): Router {
  const router = Router()
  let reservationService: ReservationService | null = null

  router.use(async (req, res, next) => {
    try {
      await persistence.isReady()
      if (!reservationService) {
        reservationService = new ReservationService(
          new ReservationRepository(persistence.getDatabase()),
        )
      }
      next()
    } catch (err) {
      next(err)
    }
  })

  function getService(): ReservationService {
    if (!reservationService) {
      throw new Error('[star-hotel] reservation service used before persistence ready')
    }
    return reservationService
  }

  router.get(
    '/',
    asyncHandler(async (req, res, next) => {
      try {
        const q = reservationListQuerySchema.parse(req.query)
        res.status(200).json(getService().list(q))
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
        res.status(200).json(getService().get(id))
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
        res.status(201).json(getService().create(body))
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
        res.status(200).json(getService().update(id, body))
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
        getService().delete(id)
        res.status(204).send()
      } catch (err) {
        next(err)
      }
    }),
  )

  return router
}
