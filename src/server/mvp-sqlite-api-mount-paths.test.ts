import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createServerApp } from './create-app';
import { mountMvpSqliteEmbeddedApi } from './mvp-sqlite-api-composition';
import {
  createSqlitePersistencePort,
  type SqlitePersistencePort,
} from './persistence/sqlite-persistence';
import { MVP_SQLITE_API_DOMAIN_MOUNT_PATHS } from './register-mvp-sqlite-api-routes';

describe('MVP SQLite API mount paths', () => {
  it('domain mount list stays aligned with EMBEDDED_API_PATHS (registration drift guard)', () => {
    expect([...MVP_SQLITE_API_DOMAIN_MOUNT_PATHS]).toEqual([
      EMBEDDED_API_PATHS.guests,
      EMBEDDED_API_PATHS.rooms,
      EMBEDDED_API_PATHS.reservations,
      EMBEDDED_API_PATHS.reports,
      EMBEDDED_API_PATHS.users,
    ]);
  });

  describe('live HTTP probes', () => {
    let persistence: SqlitePersistencePort;

    afterEach(async () => {
      await persistence.close();
    });

    it('domain routers respond on expected URLs (reports router has no GET /)', async () => {
      persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' });
      await persistence.isReady();

      const app = await createServerApp({
        persistence,
        registerApiRoutes: (expressApp) => {
          mountMvpSqliteEmbeddedApi(expressApp, persistence);
        },
      });

      const paths = [
        EMBEDDED_API_PATHS.guests,
        EMBEDDED_API_PATHS.rooms,
        EMBEDDED_API_PATHS.reservations,
        `${EMBEDDED_API_PATHS.reportsDaySheet}?date=2026-01-01`,
        EMBEDDED_API_PATHS.users,
      ];

      for (const path of paths) {
        await request(app)
          .get(path)
          .expect((res) => {
            expect(res.status, `${path} should be mounted`).not.toBe(404);
          });
      }

      expect(EMBEDDED_API_PATHS.reportsDaySheet.startsWith(EMBEDDED_API_PATHS.reports)).toBe(true);
    });
  });
});
