import { loginBodySchema } from '@shared/schemas/auth';
import type { Express } from 'express';
import {
  createSqliteDomainRouter,
  type SqliteHttpAdapterKit,
} from '../http/sqlite-http-adapter-kit';
import { AuthService } from './auth-service';
import { UserRepository } from './user-repository';

export function registerAuthRoutes(app: Express, kit: SqliteHttpAdapterKit): void {
  const getAuthService = kit.createLazySqliteService(
    (db) => new AuthService(new UserRepository(db)),
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
      const user = svc.me(token);
      res.status(200).json({ user });
    }),
  );

  app.use('/api/auth', router);
}
