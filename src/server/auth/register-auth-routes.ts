import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import { loginBodySchema } from '@shared/schemas/auth';
import { changePasswordBodySchema } from '@shared/schemas/auth-password';
import type { Express } from 'express';
import {
  createSqliteDomainRouter,
  type SqliteHttpAdapterKit,
} from '../http/sqlite-http-adapter-kit';
import { AuthService } from './auth-service';
import type { StarHotelSessionStore } from './session-store';
import { UserModuleRepository } from './user-module-repository';
import { UserRepository } from './user-repository';

export function registerAuthRoutes(
  app: Express,
  kit: SqliteHttpAdapterKit,
  options: { readonly sessionStore: StarHotelSessionStore },
): void {
  const getAuthService = kit.createLazySqliteService(
    (db) =>
      new AuthService(new UserRepository(db), options.sessionStore, new UserModuleRepository(db)),
  );

  const router = createSqliteDomainRouter(kit);

  router.post(
    '/login',
    kit.asyncHandler(async (req, res) => {
      const body = loginBodySchema.parse(req.body);
      const svc = await getAuthService();
      const json = await svc.login(body);
      res.status(200).json(json);
    }),
  );

  router.post(
    '/logout',
    kit.asyncHandler(async (req, res) => {
      const raw = req.headers.authorization;
      const token = raw?.startsWith('Bearer ') ? raw.slice(7) : undefined;
      const svc = await getAuthService();
      svc.logout(token);
      res.status(204).send();
    }),
  );

  router.get(
    '/me',
    kit.asyncHandler(async (req, res) => {
      const raw = req.headers.authorization;
      const token = raw?.startsWith('Bearer ') ? raw.slice(7) : undefined;
      const svc = await getAuthService();
      const payload = svc.me(token);
      res.status(200).json(payload);
    }),
  );

  router.post(
    '/change-password',
    kit.asyncHandler(async (req, res) => {
      const body = changePasswordBodySchema.parse(req.body);
      const raw = req.headers.authorization;
      const token = raw?.startsWith('Bearer ') ? raw.slice(7) : undefined;
      const svc = await getAuthService();
      const { user } = svc.me(token);
      await svc.changePassword(user.id, body);
      res.status(204).send();
    }),
  );

  app.use(EMBEDDED_API_PATHS.auth, router);
}
