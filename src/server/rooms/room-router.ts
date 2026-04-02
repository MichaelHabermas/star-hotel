import {
  roomCreateBodySchema,
  roomIdParamsSchema,
  roomListQuerySchema,
  roomUpdateBodySchema,
} from '@shared/schemas/room';
import type { Router } from 'express';
import {
  createSqliteDomainRouter,
  type SqliteHttpAdapterKit,
} from '../http/sqlite-http-adapter-kit';
import { RoomRepository } from './room-repository';
import { RoomService } from './room-service';

export function createRoomRouter(kit: SqliteHttpAdapterKit): Router {
  const router = createSqliteDomainRouter(kit);
  const getRoomService = kit.createLazySqliteService(
    (db) => new RoomService(new RoomRepository(db)),
  );

  router.get(
    '/',
    kit.asyncHandler(async (req, res) => {
      const q = roomListQuerySchema.parse(req.query);
      const svc = await getRoomService();
      res.status(200).json(svc.list(q));
    }),
  );

  router.get(
    '/:id',
    kit.asyncHandler(async (req, res) => {
      const { id } = roomIdParamsSchema.parse(req.params);
      const svc = await getRoomService();
      res.status(200).json(svc.get(id));
    }),
  );

  router.post(
    '/',
    kit.asyncHandler(async (req, res) => {
      const body = roomCreateBodySchema.parse(req.body);
      const svc = await getRoomService();
      res.status(201).json(svc.create(body));
    }),
  );

  router.patch(
    '/:id',
    kit.asyncHandler(async (req, res) => {
      const { id } = roomIdParamsSchema.parse(req.params);
      const body = roomUpdateBodySchema.parse(req.body);
      const svc = await getRoomService();
      res.status(200).json(svc.update(id, body));
    }),
  );

  router.delete(
    '/:id',
    kit.asyncHandler(async (req, res) => {
      const { id } = roomIdParamsSchema.parse(req.params);
      const svc = await getRoomService();
      svc.delete(id);
      res.status(204).send();
    }),
  );

  return router;
}
