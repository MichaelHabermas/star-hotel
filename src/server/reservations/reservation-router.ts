import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import {
  reservationCreateBodySchema,
  reservationIdParamsSchema,
  reservationListQuerySchema,
  reservationUpdateBodySchema,
} from '@shared/schemas/reservation';
import type { Express, Router } from 'express';
import { registerSqliteJsonEntityCrudRoutes } from '../http/sqlite-entity-json-crud';
import {
  createSqliteDomainRouter,
  type SqliteHttpAdapterKit,
} from '../http/sqlite-http-adapter-kit';
import { ReservationRepository } from './reservation-repository';
import { ReservationService } from './reservation-service';

export function createReservationRouter(kit: SqliteHttpAdapterKit): Router {
  const router = createSqliteDomainRouter(kit);
  const getReservationService = kit.createLazySqliteService(
    (db) => new ReservationService(new ReservationRepository(db)),
  );

  registerSqliteJsonEntityCrudRoutes(router, kit, {
    getService: getReservationService,
    listQuerySchema: reservationListQuerySchema,
    list: (svc, q) => svc.list(q),
    idParamsSchema: reservationIdParamsSchema,
    createBodySchema: reservationCreateBodySchema,
    updateBodySchema: reservationUpdateBodySchema,
    getById: (svc, id) => svc.get(id),
    create: (svc, body) => svc.create(body),
    update: (svc, id, body) => svc.update(id, body),
    remove: (svc, id) => svc.delete(id),
  });

  return router;
}

export function registerReservationRoutes(app: Express, kit: SqliteHttpAdapterKit): void {
  app.use(EMBEDDED_API_PATHS.reservations, createReservationRouter(kit));
}
