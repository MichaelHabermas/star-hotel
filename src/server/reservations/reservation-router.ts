import {
  reservationCreateBodySchema,
  reservationIdParamsSchema,
  reservationListQuerySchema,
  reservationUpdateBodySchema,
} from '@shared/schemas/reservation'
import { Router } from 'express'
import type { SqliteHttpAdapterKit } from '../http/sqlite-http-adapter-kit'
import { ReservationRepository } from './reservation-repository'
import { ReservationService } from './reservation-service'

export function createReservationRouter(kit: SqliteHttpAdapterKit): Router {
  const router = Router()
  const getReservationService = kit.createLazySqliteService(
    (db) => new ReservationService(new ReservationRepository(db)),
  )

  router.use(kit.ensurePersistenceReady)

  router.get(
    '/',
    kit.asyncHandler(async (req, res) => {
      const q = reservationListQuerySchema.parse(req.query)
      const svc = await getReservationService()
      res.status(200).json(svc.list(q))
    }),
  )

  router.get(
    '/:id',
    kit.asyncHandler(async (req, res) => {
      const { id } = reservationIdParamsSchema.parse(req.params)
      const svc = await getReservationService()
      res.status(200).json(svc.get(id))
    }),
  )

  router.post(
    '/',
    kit.asyncHandler(async (req, res) => {
      const body = reservationCreateBodySchema.parse(req.body)
      const svc = await getReservationService()
      res.status(201).json(svc.create(body))
    }),
  )

  router.patch(
    '/:id',
    kit.asyncHandler(async (req, res) => {
      const { id } = reservationIdParamsSchema.parse(req.params)
      const body = reservationUpdateBodySchema.parse(req.body)
      const svc = await getReservationService()
      res.status(200).json(svc.update(id, body))
    }),
  )

  router.delete(
    '/:id',
    kit.asyncHandler(async (req, res) => {
      const { id } = reservationIdParamsSchema.parse(req.params)
      const svc = await getReservationService()
      svc.delete(id)
      res.status(204).send()
    }),
  )

  return router
}
