import 'dotenv/config'

import { app } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createEmbeddedApiStack } from './embedded-api-stack'
import { startStarHotelMain } from './bootstrap'
import { registerActivateHandler, registerWindowAllClosed } from './lifecycle'
import { configureAppMenu } from './menu'
import { createMainWindow } from './window'
import { initMainTelemetry } from './telemetry-main'
import { mainProcessLogger } from '../server/logging/structured-logger'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appStartMs = Date.now()

initMainTelemetry()

const isDev = !app.isPackaged
configureAppMenu(isDev)

const stack = createEmbeddedApiStack({
  getUserDataPath: () => app.getPath('userData'),
  env: process.env,
  seedDevData: isDev,
})

stack.registerShutdownHandlers(app)

function mainWindowParams(): {
  readonly scriptDir: string
  readonly isDev: boolean
  readonly rendererUrl: string | undefined
  readonly apiBaseUrl: string
} {
  return {
    scriptDir: __dirname,
    isDev,
    rendererUrl: process.env['ELECTRON_RENDERER_URL'],
    apiBaseUrl: stack.apiBaseUrl,
  }
}

void startStarHotelMain({
  app,
  appStartMs,
  apiBaseUrl: stack.apiBaseUrl,
  ensureEmbeddedApiAndIpc: stack.ensureEmbeddedApiAndIpc,
  registerWindowAllClosed,
  registerActivateHandler,
  createMainWindow,
  mainWindowParams,
  logger: mainProcessLogger,
})
