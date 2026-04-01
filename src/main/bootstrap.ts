import type http from 'node:http'
import type { App } from 'electron'
import type { MainWindowDeps } from './window'

export type StarHotelMainDeps = {
  readonly app: Pick<App, 'whenReady' | 'quit'>
  readonly appStartMs: number
  readonly apiBaseUrl: string
  readonly ensureEmbeddedApiServer: () => Promise<http.Server>
  readonly registerIpcHandlers: () => void
  readonly registerWindowAllClosed: () => void
  readonly registerActivateHandler: (createWindow: () => void) => void
  readonly createMainWindow: (deps: MainWindowDeps) => unknown
  readonly mainWindowParams: () => MainWindowDeps
  readonly logger: Pick<Console, 'log' | 'error'>
}

/**
 * Main-process startup: embedded API, IPC, first window, then macOS activate handler.
 * Dependencies are injected for unit tests.
 */
export async function startStarHotelMain(d: StarHotelMainDeps): Promise<void> {
  d.registerWindowAllClosed()

  await d.app.whenReady()

  const readyMs = Date.now() - d.appStartMs
  d.logger.log(`[star-hotel] app.whenReady() + ${readyMs}ms from process start (see docs/PERF.md)`)

  try {
    await d.ensureEmbeddedApiServer()
    d.logger.log(`[star-hotel] API ${d.apiBaseUrl} (see docs/PERF.md)`)
  } catch (err) {
    d.logger.error('[star-hotel] embedded API server failed to start', err)
    d.app.quit()
    return
  }

  d.registerIpcHandlers()

  d.createMainWindow(d.mainWindowParams())

  d.registerActivateHandler(() => {
    d.createMainWindow(d.mainWindowParams())
  })
}
