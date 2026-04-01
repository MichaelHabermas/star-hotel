import { app } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEFAULT_API_PORT } from '@shared/constants'
import { startEmbeddedApiServer } from './http-server'
import { registerWindowLifecycle } from './lifecycle'
import { createMainWindow, type MainWindowDeps } from './window'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isDev = !app.isPackaged
const appStartMs = Date.now()

const apiPort = Number(process.env['STAR_HOTEL_PORT']) || DEFAULT_API_PORT

const mainWindowDeps: MainWindowDeps = {
  scriptDir: __dirname,
  isDev,
  rendererUrl: process.env['ELECTRON_RENDERER_URL'],
}

registerWindowLifecycle(() => {
  createMainWindow(mainWindowDeps)
})

app.whenReady().then(async () => {
  const readyMs = Date.now() - appStartMs
  console.log(`[star-hotel] app.whenReady() + ${readyMs}ms from process start (see docs/PERF.md)`)

  try {
    await startEmbeddedApiServer(apiPort)
    console.log(`[star-hotel] API http://127.0.0.1:${apiPort} (see docs/PERF.md)`)
  } catch (err) {
    console.error('[star-hotel] embedded API server failed to start', err)
    app.quit()
    return
  }

  createMainWindow(mainWindowDeps)
})
