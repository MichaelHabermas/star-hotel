import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createServerApp } from './create-app';
import type { PersistencePort } from './ports/persistence';

describe('createServerApp', () => {
  it('GET /health returns ok', async () => {
    const app = createServerApp();
    const res = await request(app).get(EMBEDDED_API_PATHS.health).expect(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /health includes CORS for localhost Origin (browser + Vite dev)', async () => {
    const app = createServerApp();
    const res = await request(app)
      .get(EMBEDDED_API_PATHS.health)
      .set('Origin', 'http://localhost:5173')
      .expect(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.body).toEqual({ ok: true });
  });

  it('OPTIONS /health preflight succeeds for localhost Origin', async () => {
    const app = createServerApp();
    await request(app)
      .options(EMBEDDED_API_PATHS.health)
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET')
      .expect(204);
  });

  it('awaits persistence isReady before responding', async () => {
    let ready = false;
    const persistence: PersistencePort = {
      async isReady() {
        ready = true;
      },
      async close() {
        /* test */
      },
    };
    const app = createServerApp({ persistence });
    await request(app).get(EMBEDDED_API_PATHS.health).expect(200);
    expect(ready).toBe(true);
  });
});
