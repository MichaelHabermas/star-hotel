import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createStarHotelApiErrorHandler } from '../create-app-pipeline';
import { registerSqliteJsonEntityCrudRoutes } from './sqlite-entity-json-crud';
import type { SqliteHttpAdapterKit } from './sqlite-http-adapter-kit';

type Widget = { id: number; name: string };

class WidgetService {
  private nextId = 1;
  private readonly rows = new Map<number, Widget>();

  list(): Widget[] {
    return Array.from(this.rows.values());
  }

  get(id: number): Widget {
    const w = this.rows.get(id);
    if (!w) {
      throw new Error('not found');
    }
    return w;
  }

  create(body: { name: string }): Widget {
    const id = this.nextId++;
    const w = { id, name: body.name };
    this.rows.set(id, w);
    return w;
  }

  update(id: number, body: { name?: string }): Widget {
    const w = this.rows.get(id);
    if (!w) {
      throw new Error('not found');
    }
    const next = { ...w, ...body };
    this.rows.set(id, next);
    return next;
  }

  remove(id: number): void {
    this.rows.delete(id);
  }
}

function minimalKit(): SqliteHttpAdapterKit {
  return {
    asyncHandler(fn) {
      return (req, res, next) => {
        void fn(req, res, next).catch(next);
      };
    },
    ensurePersistenceReady: (_req, _res, next) => next(),
    createLazySqliteService: () => {
      throw new Error('unused');
    },
  } as SqliteHttpAdapterKit;
}

describe('registerSqliteJsonEntityCrudRoutes', () => {
  it('wires list/get/create/patch/delete with expected status codes', async () => {
    const kit = minimalKit();
    const widgetService = new WidgetService();
    const getService = async () => widgetService;
    const router = express.Router();

    registerSqliteJsonEntityCrudRoutes(router, kit, {
      getService,
      listQuerySchema: z.object({}).strict(),
      list: (svc) => svc.list(),
      idParamsSchema: z.object({ id: z.coerce.number().int().positive() }),
      createBodySchema: z.object({ name: z.string().min(1) }),
      updateBodySchema: z.object({ name: z.string().min(1).optional() }),
      getById: (svc, id) => svc.get(id),
      create: (svc, body) => svc.create(body),
      update: (svc, id, body) => svc.update(id, body),
      remove: (svc, id) => svc.remove(id),
    });

    const app = express();
    app.use(express.json());
    app.use('/widgets', router);
    app.use(createStarHotelApiErrorHandler());

    await request(app).get('/widgets').expect(200).expect([]);

    const created = await request(app)
      .post('/widgets')
      .send({ name: 'Desk' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ id: 1, name: 'Desk' });
      });

    const id = created.body.id as number;

    await request(app)
      .get(`/widgets/${id}`)
      .expect(200)
      .expect({ id: 1, name: 'Desk' });

    await request(app)
      .patch(`/widgets/${id}`)
      .send({ name: 'Lamp' })
      .expect(200)
      .expect({ id: 1, name: 'Lamp' });

    await request(app).delete(`/widgets/${id}`).expect(204);

    await request(app).get('/widgets').expect(200).expect([]);
  });

  it('returns 400 when create body fails Zod', async () => {
    const kit = minimalKit();
    const router = express.Router();
    registerSqliteJsonEntityCrudRoutes(router, kit, {
      getService: async () => new WidgetService(),
      listQuerySchema: z.object({}).strict(),
      list: (svc) => svc.list(),
      idParamsSchema: z.object({ id: z.coerce.number().int().positive() }),
      createBodySchema: z.object({ name: z.string().min(1) }),
      updateBodySchema: z.object({ name: z.string().optional() }),
      getById: (svc, id) => svc.get(id),
      create: (svc, body) => svc.create(body),
      update: (svc, id, body) => svc.update(id, body),
      remove: (svc, id) => svc.remove(id),
    });

    const app = express();
    app.use(express.json());
    app.use('/widgets', router);
    app.use(createStarHotelApiErrorHandler());

    await request(app).post('/widgets').send({ name: '' }).expect(400);
  });
});
