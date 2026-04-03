import type { Router } from 'express';
import type { z } from 'zod';
import type { SqliteHttpAdapterKit } from './sqlite-http-adapter-kit';

export type SqliteJsonEntityCrudSpec<
  Svc,
  TListQuery = unknown,
  TCreate = unknown,
  TUpdate = unknown,
> = {
  readonly getService: () => Promise<Svc>;
  readonly listQuerySchema: z.ZodType<TListQuery>;
  readonly list: (svc: Svc, query: TListQuery) => unknown;
  readonly idParamsSchema: z.ZodType<{ id: number }>;
  readonly createBodySchema: z.ZodType<TCreate>;
  readonly updateBodySchema: z.ZodType<TUpdate>;
  readonly getById: (svc: Svc, id: number) => unknown;
  readonly create: (svc: Svc, body: TCreate) => unknown;
  readonly update: (svc: Svc, id: number, body: TUpdate) => unknown;
  readonly remove: (svc: Svc, id: number) => void;
};

/** Standard GET/POST/PATCH/DELETE JSON CRUD for SQLite-backed domain routers. */
export function registerSqliteJsonEntityCrudRoutes<Svc, TListQuery, TCreate, TUpdate>(
  router: Router,
  kit: SqliteHttpAdapterKit,
  spec: SqliteJsonEntityCrudSpec<Svc, TListQuery, TCreate, TUpdate>,
): void {
  router.get(
    '/',
    kit.asyncHandler(async (req, res) => {
      const q = spec.listQuerySchema.parse(req.query);
      const svc = await spec.getService();
      res.status(200).json(spec.list(svc, q));
    }),
  );

  router.get(
    '/:id',
    kit.asyncHandler(async (req, res) => {
      const { id } = spec.idParamsSchema.parse(req.params);
      const svc = await spec.getService();
      res.status(200).json(spec.getById(svc, id));
    }),
  );

  router.post(
    '/',
    kit.asyncHandler(async (req, res) => {
      const body = spec.createBodySchema.parse(req.body);
      const svc = await spec.getService();
      res.status(201).json(spec.create(svc, body));
    }),
  );

  router.patch(
    '/:id',
    kit.asyncHandler(async (req, res) => {
      const { id } = spec.idParamsSchema.parse(req.params);
      const body = spec.updateBodySchema.parse(req.body);
      const svc = await spec.getService();
      res.status(200).json(spec.update(svc, id, body));
    }),
  );

  router.delete(
    '/:id',
    kit.asyncHandler(async (req, res) => {
      const { id } = spec.idParamsSchema.parse(req.params);
      const svc = await spec.getService();
      spec.remove(svc, id);
      res.status(204).send();
    }),
  );
}
