import { buildApiBaseUrl, resolveApiPortFromEnv } from '@shared/embedded-api-config';
import type { App } from 'electron';
import type http from 'node:http';
import { resolveDatabaseFilePath } from '../server/db/database-path';
import { createMvpSqliteApiComposition } from '../server/mvp-sqlite-api-composition';
import { createSqlitePersistencePort as defaultCreateSqlitePersistencePort } from '../server/persistence/sqlite-persistence';
import type { PersistencePort } from '../server/ports/persistence';
import { registerEmbeddedApiShutdownHandlers } from './embedded-api-shutdown';
import { startEmbeddedApiServer as defaultStartEmbeddedApiServer } from './http-server';
import { registerIpcHandlers as registerIpcHandlersImpl } from './ipc-handlers';

export type CreateEmbeddedApiStackOptions = {
  readonly getUserDataPath: () => string;
  readonly env: NodeJS.ProcessEnv;
  /** Unpackaged dev: seed fake reservations when the DB has none. */
  readonly seedDevData?: boolean;
  /** Defaults to production SQLite adapter; inject for tests. */
  readonly createSqlitePersistencePort?: typeof defaultCreateSqlitePersistencePort;
  /** Defaults to real HTTP listener; inject to avoid binding ports in tests. */
  readonly startEmbeddedApiServer?: typeof defaultStartEmbeddedApiServer;
};

export type EmbeddedApiStack = {
  readonly apiPort: number;
  readonly apiBaseUrl: string;
  /**
   * Starts the embedded Express + SQLite stack (once) and registers IPC handlers (once).
   * Safe to call multiple times; subsequent calls return the same server promise.
   */
  ensureEmbeddedApiAndIpc(): Promise<http.Server>;
  registerShutdownHandlers(app: App): void;
};

/**
 * Wires embedded Express + SQLite + IPC for the main process. Injected env and userData path keep this testable.
 */
export function createEmbeddedApiStack(options: CreateEmbeddedApiStackOptions): EmbeddedApiStack {
  const apiPort = resolveApiPortFromEnv(options.env);
  const apiBaseUrl = buildApiBaseUrl(apiPort);
  const createSqlitePersistencePort =
    options.createSqlitePersistencePort ?? defaultCreateSqlitePersistencePort;
  const startEmbeddedApiServer = options.startEmbeddedApiServer ?? defaultStartEmbeddedApiServer;

  let persistence: PersistencePort | null = null;
  let embeddedApiServerPromise: Promise<http.Server> | null = null;
  let ipcRegistered = false;

  function ensureEmbeddedApiServer(): Promise<http.Server> {
    if (!embeddedApiServerPromise) {
      const dbFilePath = resolveDatabaseFilePath(options.getUserDataPath());
      const sqlite = createSqlitePersistencePort({
        dbFilePath,
        ...(options.seedDevData ? { seedDevData: true } : {}),
      });
      persistence = sqlite;
      const mvpApi = createMvpSqliteApiComposition(sqlite);
      embeddedApiServerPromise = startEmbeddedApiServer(apiPort, {
        persistence: sqlite,
        registerApiRoutes: (app) => {
          mvpApi.mount(app);
        },
      });
    }
    return embeddedApiServerPromise;
  }

  function registerIpcOnce(): void {
    if (ipcRegistered) {
      return;
    }
    if (!persistence) {
      throw new Error('[star-hotel] IPC registered before embedded API started');
    }
    ipcRegistered = true;
    const activePersistence = persistence;
    registerIpcHandlersImpl({
      getPersistence: () => activePersistence,
    });
  }

  async function ensureEmbeddedApiAndIpc(): Promise<http.Server> {
    const server = await ensureEmbeddedApiServer();
    registerIpcOnce();
    return server;
  }

  function registerShutdownHandlers(app: App): void {
    registerEmbeddedApiShutdownHandlers(app, {
      getEmbeddedApiServerPromise: () => embeddedApiServerPromise,
      getPersistence: () => persistence,
    });
  }

  return {
    apiPort,
    apiBaseUrl,
    ensureEmbeddedApiAndIpc,
    registerShutdownHandlers,
  };
}
