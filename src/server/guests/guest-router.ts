import {
  guestCreateBodySchema,
  guestIdParamsSchema,
  guestListQuerySchema,
  guestUpdateBodySchema,
} from '@shared/schemas/guest';
import { Router } from 'express';
import type { SqliteHttpAdapterKit } from '../http/sqlite-http-adapter-kit';
import { GuestRepository } from './guest-repository';
import { GuestService } from './guest-service';

export function createGuestRouter(kit: SqliteHttpAdapterKit): Router {
  const router = Router();
  const getGuestService = kit.createLazySqliteService(
    (db) => new GuestService(new GuestRepository(db)),
  );

  router.use(kit.ensurePersistenceReady);

  router.get(
    '/',
    kit.asyncHandler(async (req, res) => {
      guestListQuerySchema.parse(req.query);
      const svc = await getGuestService();
      res.status(200).json(svc.list());
    }),
  );

  router.get(
    '/:id',
    kit.asyncHandler(async (req, res) => {
      const { id } = guestIdParamsSchema.parse(req.params);
      const svc = await getGuestService();
      res.status(200).json(svc.get(id));
    }),
  );

  router.post(
    '/',
    kit.asyncHandler(async (req, res) => {
      const body = guestCreateBodySchema.parse(req.body);
      const svc = await getGuestService();
      res.status(201).json(svc.create(body));
    }),
  );

  router.patch(
    '/:id',
    kit.asyncHandler(async (req, res) => {
      const { id } = guestIdParamsSchema.parse(req.params);
      const body = guestUpdateBodySchema.parse(req.body);
      const svc = await getGuestService();
      res.status(200).json(svc.update(id, body));
    }),
  );

  router.delete(
    '/:id',
    kit.asyncHandler(async (req, res) => {
      const { id } = guestIdParamsSchema.parse(req.params);
      const svc = await getGuestService();
      svc.delete(id);
      res.status(204).send();
    }),
  );

  return router;
}
