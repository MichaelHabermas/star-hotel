import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import {
  roomCreateBodySchema,
  roomIdParamsSchema,
  roomListQuerySchema,
  roomUpdateBodySchema,
} from '@shared/schemas/room';
import type { Express, Router } from 'express';
import { registerSqliteJsonEntityCrudRoutes } from '../http/sqlite-entity-json-crud';
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

  registerSqliteJsonEntityCrudRoutes(router, kit, {
    getService: getRoomService,
    listQuerySchema: roomListQuerySchema,
    list: (svc, q) => svc.list(q),
    idParamsSchema: roomIdParamsSchema,
    createBodySchema: roomCreateBodySchema,
    updateBodySchema: roomUpdateBodySchema,
    getById: (svc, id) => svc.get(id),
    create: (svc, body) => svc.create(body),
    update: (svc, id, body) => svc.update(id, body),
    remove: (svc, id) => svc.delete(id),
  });

  return router;
}

export function registerRoomRoutes(app: Express, kit: SqliteHttpAdapterKit): void {
  app.use(EMBEDDED_API_PATHS.rooms, createRoomRouter(kit));
}
