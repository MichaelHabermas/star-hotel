import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createServerApp } from './create-app';
import { mountMvpSqliteEmbeddedApi } from './mvp-sqlite-api-composition';
import {
  createSqlitePersistencePort,
  type SqlitePersistencePort,
} from './persistence/sqlite-persistence';

/**
 * Integration smoke: same mount entry as production (`embedded-api-stack`) on an in-memory DB.
 * Vitest sets `STAR_HOTEL_SKIP_AUTH=1` globally — stub it off here to assert real Bearer behavior.
 */
describe('mountMvpSqliteEmbeddedApi (smoke)', () => {
  let persistence: SqlitePersistencePort;

  beforeEach(() => {
    vi.stubEnv('STAR_HOTEL_SKIP_AUTH', '');
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await persistence.close();
  });

  it('serves health and rejects unauthenticated domain API', async () => {
    persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' });
    await persistence.isReady();

    const app = await createServerApp({
      persistence,
      registerApiRoutes: (expressApp) => {
        mountMvpSqliteEmbeddedApi(expressApp, persistence);
      },
    });

    await request(app).get(EMBEDDED_API_PATHS.health).expect(200).expect({ ok: true });

    await request(app).get(EMBEDDED_API_PATHS.guests).expect(401);
  });

  it('login returns a token and Bearer authorizes guests list', async () => {
    persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' });
    await persistence.isReady();

    const app = await createServerApp({
      persistence,
      registerApiRoutes: (expressApp) => {
        mountMvpSqliteEmbeddedApi(expressApp, persistence);
      },
    });

    const login = await request(app)
      .post(EMBEDDED_API_PATHS.authLogin)
      .send({ username: 'admin', password: 'changeme' })
      .expect(200);

    const token = login.body.token as string;
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);

    await request(app)
      .get(EMBEDDED_API_PATHS.guests)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
