import type { Express } from 'express';
import http from 'node:http';
import { createServerApp } from '../server/create-app';
import type { PersistencePort } from '../server/ports/persistence';

export type StartEmbeddedApiServerOptions = {
  readonly persistence?: PersistencePort;
  readonly registerApiRoutes?: (app: Express) => void;
};

/**
 * Binds the embedded API on 127.0.0.1. Call during `app.whenReady()` before creating windows
 * so the renderer can reach `/health` immediately.
 */
export async function startEmbeddedApiServer(
  port: number,
  options: StartEmbeddedApiServerOptions = {},
): Promise<http.Server> {
  const expressApp = await createServerApp({
    persistence: options.persistence,
    registerApiRoutes: options.registerApiRoutes,
  });
  const server = http.createServer(expressApp);

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}
