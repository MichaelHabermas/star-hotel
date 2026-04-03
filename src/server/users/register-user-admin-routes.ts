import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import {
  userAdminCreateBodySchema,
  userAdminUpdateBodySchema,
  userIdParamsSchema,
  userModulesPutBodySchema,
} from '@shared/schemas/user-admin';
import type { Express, Router } from 'express';
import { UserModuleRepository } from '../auth/user-module-repository';
import { UserRepository } from '../auth/user-repository';
import { requireStarHotelRoles } from '../http/require-star-hotel-role';
import {
  createSqliteDomainRouter,
  type SqliteHttpAdapterKit,
} from '../http/sqlite-http-adapter-kit';
import { UserAdminService } from './user-admin-service';

export function createUserAdminRouter(kit: SqliteHttpAdapterKit): Router {
  const router = createSqliteDomainRouter(kit);
  const getService = kit.createLazySqliteService(
    (db) => new UserAdminService(new UserRepository(db), new UserModuleRepository(db)),
  );

  router.get(
    '/',
    requireStarHotelRoles('Admin'),
    kit.asyncHandler(async (_req, res) => {
      const svc = await getService();
      res.status(200).json(svc.list());
    }),
  );

  router.post(
    '/',
    requireStarHotelRoles('Admin'),
    kit.asyncHandler(async (req, res) => {
      const body = userAdminCreateBodySchema.parse(req.body);
      const svc = await getService();
      const created = await svc.create(body);
      res.status(201).json(created);
    }),
  );

  router.patch(
    '/:id',
    requireStarHotelRoles('Admin'),
    kit.asyncHandler(async (req, res) => {
      const { id } = userIdParamsSchema.parse(req.params);
      const body = userAdminUpdateBodySchema.parse(req.body);
      const svc = await getService();
      const updated = svc.update(id, body);
      res.status(200).json(updated);
    }),
  );

  router.delete(
    '/:id',
    requireStarHotelRoles('Admin'),
    kit.asyncHandler(async (req, res) => {
      const { id } = userIdParamsSchema.parse(req.params);
      const svc = await getService();
      svc.delete(id);
      res.status(204).send();
    }),
  );

  router.get(
    '/:id/modules',
    requireStarHotelRoles('Admin'),
    kit.asyncHandler(async (req, res) => {
      const { id } = userIdParamsSchema.parse(req.params);
      const svc = await getService();
      const detail = svc.getModules(id);
      res.status(200).json(detail);
    }),
  );

  router.put(
    '/:id/modules',
    requireStarHotelRoles('Admin'),
    kit.asyncHandler(async (req, res) => {
      const { id } = userIdParamsSchema.parse(req.params);
      const body = userModulesPutBodySchema.parse(req.body);
      const svc = await getService();
      const detail = svc.putModules(id, body);
      res.status(200).json(detail);
    }),
  );

  return router;
}

export function registerUserAdminRoutes(app: Express, kit: SqliteHttpAdapterKit): void {
  app.use(EMBEDDED_API_PATHS.users, createUserAdminRouter(kit));
}
