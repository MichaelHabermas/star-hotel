import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import {
  guestCreateBodySchema,
  guestIdParamsSchema,
  guestListQuerySchema,
  guestUpdateBodySchema,
} from '@shared/schemas/guest';
import type { Express, Router } from 'express';
import { registerSqliteJsonEntityCrudRoutes } from '../http/sqlite-entity-json-crud';
import {
  createSqliteDomainRouter,
  type SqliteHttpAdapterKit,
} from '../http/sqlite-http-adapter-kit';
import { GuestRepository } from './guest-repository';
import { GuestService } from './guest-service';

export function createGuestRouter(kit: SqliteHttpAdapterKit): Router {
  const router = createSqliteDomainRouter(kit);
  const getGuestService = kit.createLazySqliteService(
    (db) => new GuestService(new GuestRepository(db)),
  );

  registerSqliteJsonEntityCrudRoutes(router, kit, {
    getService: getGuestService,
    listQuerySchema: guestListQuerySchema,
    list: (svc, q) => {
      void q;
      return svc.list();
    },
    idParamsSchema: guestIdParamsSchema,
    createBodySchema: guestCreateBodySchema,
    updateBodySchema: guestUpdateBodySchema,
    getById: (svc, id) => svc.get(id),
    create: (svc, body) => svc.create(body),
    update: (svc, id, body) => svc.update(id, body),
    remove: (svc, id) => svc.delete(id),
  });

  return router;
}

export function registerGuestRoutes(app: Express, kit: SqliteHttpAdapterKit): void {
  app.use(EMBEDDED_API_PATHS.guests, createGuestRouter(kit));
}
