import type http from 'node:http'
import type { App } from 'electron'
import { buildApiBaseUrl, resolveApiPortFromEnv } from '@shared/embedded-api-config'
import { resolveDatabaseFilePath } from '../server/db/database-path'
import { createSqlitePersistencePort as defaultCreateSqlitePersistencePort } from '../server/persistence/sqlite-persistence'
import type { PersistencePort } from '../server/ports/persistence'
import { registerMvpSqliteApiRoutes } from '../server/register-mvp-sqlite-api-routes'
import { startEmbeddedApiServer as defaultStartEmbeddedApiServer } from './http-server'
import { registerIpcHandlers as registerIpcHandlersImpl } from './ipc-handlers'

export type CreateEmbeddedApiStackOptions = {
  readonly getUserDataPath: () => string
  readonly env: NodeJS.ProcessEnv
  /** Defaults to production SQLite adapter; inject for tests. */
  readonly createSqlitePersistencePort?: typeof defaultCreateSqlitePersistencePort
  /** Defaults to real HTTP listener; inject to avoid binding ports in tests. */
  readonly startEmbeddedApiServer?: typeof defaultStartEmbeddedApiServer
}

export type EmbeddedApiStack = {
  readonly apiPort: number
  readonly apiBaseUrl: string
  ensureEmbeddedApiServer(): Promise<http.Server>
  registerIpcHandlers(): void
  registerShutdownHandlers(app: App): void
}

/**
 * Wires embedded Express + SQLite + IPC for the main process. Injected env and userData path keep this testable.
 */
export function createEmbeddedApiStack(options: CreateEmbeddedApiStackOptions): EmbeddedApiStack {
  const apiPort = resolveApiPortFromEnv(options.env)
  const apiBaseUrl = buildApiBaseUrl(apiPort)
  const createSqlitePersistencePort =
    options.createSqlitePersistencePort ?? defaultCreateSqlitePersistencePort
  const startEmbeddedApiServer = options.startEmbeddedApiServer ?? defaultStartEmbeddedApiServer

  let persistence: PersistencePort | null = null
  let embeddedApiServerPromise: Promise<http.Server> | null = null
  let shutdownStarted = false

  function ensureEmbeddedApiServer(): Promise<http.Server> {
    if (!embeddedApiServerPromise) {
      const dbFilePath = resolveDatabaseFilePath(options.getUserDataPath())
      const sqlite = createSqlitePersistencePort({ dbFilePath })
      persistence = sqlite
      embeddedApiServerPromise = startEmbeddedApiServer(apiPort, {
        persistence: sqlite,
        registerApiRoutes: (app) => {
          registerMvpSqliteApiRoutes(app, sqlite)
        },
      })
    }
    return embeddedApiServerPromise
  }

  function registerIpcHandlers(): void {
    if (!persistence) {
      throw new Error('[star-hotel] IPC registered before embedded API started')
    }
    const activePersistence = persistence
    registerIpcHandlersImpl({
      getPersistence: () => activePersistence,
    })
  }

  function registerShutdownHandlers(app: App): void {
    app.on('before-quit', (e) => {
      if (shutdownStarted) {
        return
      }
      shutdownStarted = true
      e.preventDefault()
      void (async () => {
        try {
          if (embeddedApiServerPromise) {
            const server = await embeddedApiServerPromise
            await new Promise<void>((resolve, reject) => {
              server.close((err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve()
                }
              })
            })
          }
          if (persistence) {
            await persistence.close()
          }
        } catch (err) {
          console.error('[star-hotel] shutdown cleanup failed', err)
        } finally {
          app.quit()
        }
      })()
    })
  }

  return {
    apiPort,
    apiBaseUrl,
    ensureEmbeddedApiServer,
    registerIpcHandlers,
    registerShutdownHandlers,
  }
}
