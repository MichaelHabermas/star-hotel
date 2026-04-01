import type http from 'node:http'
import { app } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApiBaseUrl, resolveApiPort } from '@shared/embedded-api-config'
import { startEmbeddedApiServer } from './http-server'
import { registerIpcHandlers } from './ipc-handlers'
import { registerActivateHandler, registerWindowAllClosed } from './lifecycle'
import { createMainWindow } from './window'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isDev = !app.isPackaged
const appStartMs = Date.now()

const apiPort = resolveApiPort(process.env)

const apiBaseUrl = buildApiBaseUrl(apiPort)

let embeddedApiServerPromise: Promise<http.Server> | null = null

function ensureEmbeddedApiServer(): Promise<http.Server> {
  if (!embeddedApiServerPromise) {
    embeddedApiServerPromise = startEmbeddedApiServer(apiPort)
  }
  return embeddedApiServerPromise
}

function mainWindowParams() {
  return {
    scriptDir: __dirname,
    isDev,
    rendererUrl: process.env['ELECTRON_RENDERER_URL'],
    apiBaseUrl,
  } as const
}

registerWindowAllClosed()

app.whenReady().then(async () => {
  const readyMs = Date.now() - appStartMs
  console.log(`[star-hotel] app.whenReady() + ${readyMs}ms from process start (see docs/PERF.md)`)

  try {
    await ensureEmbeddedApiServer()
    console.log(`[star-hotel] API ${apiBaseUrl} (see docs/PERF.md)`)
  } catch (err) {
    console.error('[star-hotel] embedded API server failed to start', err)
    app.quit()
    return
  }

  registerIpcHandlers()

  createMainWindow(mainWindowParams())

  registerActivateHandler(() => {
    createMainWindow(mainWindowParams())
  })
})
