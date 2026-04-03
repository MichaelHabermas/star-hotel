import express from 'express';
import {
  applyStarHotelExpressRequestPipeline,
  createStarHotelApiErrorHandler,
  registerStarHotelHealthAndOpenApi,
} from './create-app-pipeline';
import { noopPersistencePort, type PersistencePort } from './ports/persistence';

export type CreateServerAppOptions = {
  persistence?: PersistencePort;
  /** Mount `/api/*` routes (composition root). Omitted when only `/health` is needed. */
  registerApiRoutes?: (app: express.Express) => void;
};

/** Express app for the in-main API (no listen — main owns the HTTP server). */
export async function createServerApp(
  options: CreateServerAppOptions = {},
): Promise<express.Express> {
  const persistence = options.persistence ?? noopPersistencePort;

  const app = express();

  applyStarHotelExpressRequestPipeline(app);
  await registerStarHotelHealthAndOpenApi(app, persistence);

  options.registerApiRoutes?.(app);

  app.use(createStarHotelApiErrorHandler());

  return app;
}
