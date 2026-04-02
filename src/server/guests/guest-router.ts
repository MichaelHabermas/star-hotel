import { guestIdParamsSchema, guestListQuerySchema } from '@shared/schemas/guest'
import { Router } from 'express'
import type { SqliteHttpAdapterKit } from '../http/sqlite-http-adapter-kit'
import { GuestRepository } from './guest-repository'
import { GuestService } from './guest-service'

export function createGuestRouter(kit: SqliteHttpAdapterKit): Router {
  const router = Router()
  const getGuestService = kit.createLazySqliteService((db) => new GuestService(new GuestRepository(db)))

  router.use(kit.ensurePersistenceReady)

  router.get(
    '/',
    kit.asyncHandler(async (req, res, next) => {
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
    kit.asyncHandler(async (req, res, next) => {
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
