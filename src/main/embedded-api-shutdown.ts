import type http from 'node:http'
import { promisify } from 'node:util'
import type { App } from 'electron'
import type { PersistencePort } from '../server/ports/persistence'

export type EmbeddedApiShutdownDeps = {
  /** Resolves to the listening server once `ensureEmbeddedApiServer` has run; otherwise null. */
  getEmbeddedApiServerPromise: () => Promise<http.Server> | null
  getPersistence: () => PersistencePort | null
}

/**
 * Sequences HTTP `server.close()` then `persistence.close()` on Electron `before-quit`.
 * Keeps shutdown ordering out of the larger embedded stack module.
 */
export function registerEmbeddedApiShutdownHandlers(app: App, deps: EmbeddedApiShutdownDeps): void {
  let shutdownStarted = false
  app.on('before-quit', (e) => {
    if (shutdownStarted) {
      return
    }
    shutdownStarted = true
    e.preventDefault()
    void (async () => {
      try {
        const serverPromise = deps.getEmbeddedApiServerPromise()
        if (serverPromise) {
          const server = await serverPromise
          await promisify(server.close.bind(server))()
        }
        const persistence = deps.getPersistence()
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
