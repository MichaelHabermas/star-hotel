import type http from 'node:http'
import type { App } from 'electron'
import { buildApiBaseUrl, resolveApiPortFromEnv } from '@shared/embedded-api-config'
import { resolveDatabaseFilePath } from '../server/db/database-path'
import { createSqlitePersistencePort } from '../server/persistence/sqlite-persistence'
import type { PersistencePort } from '../server/ports/persistence'
import { startEmbeddedApiServer } from './http-server'
import { registerIpcHandlers as registerIpcHandlersImpl } from './ipc-handlers'

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
export function createEmbeddedApiStack(options: {
  readonly getUserDataPath: () => string
  readonly env: NodeJS.ProcessEnv
}): EmbeddedApiStack {
  const apiPort = resolveApiPortFromEnv(options.env)
  const apiBaseUrl = buildApiBaseUrl(apiPort)

  let persistence: PersistencePort | null = null
  let embeddedApiServerPromise: Promise<http.Server> | null = null
  let shutdownStarted = false

  function ensureEmbeddedApiServer(): Promise<http.Server> {
    if (!embeddedApiServerPromise) {
      const dbFilePath = resolveDatabaseFilePath(options.getUserDataPath())
      persistence = createSqlitePersistencePort({ dbFilePath })
      embeddedApiServerPromise = startEmbeddedApiServer(apiPort, {
        persistence,
      })
    }
    return embeddedApiServerPromise
  }

  function registerIpcHandlers(): void {
    registerIpcHandlersImpl({
      getPersistence: () => {
        if (!persistence) {
          throw new Error('[star-hotel] IPC registered before embedded API started')
        }
        return persistence
      },
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
