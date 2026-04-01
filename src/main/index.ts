import { app } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerWindowLifecycle } from './lifecycle'
import { createMainWindow, type MainWindowDeps } from './window'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isDev = !app.isPackaged
const appStartMs = Date.now()

const mainWindowDeps: MainWindowDeps = {
  scriptDir: __dirname,
  isDev,
  rendererUrl: process.env['ELECTRON_RENDERER_URL'],
}

registerWindowLifecycle(() => {
  createMainWindow(mainWindowDeps)
})

app.whenReady().then(() => {
  const readyMs = Date.now() - appStartMs
  console.log(`[star-hotel] app.whenReady() + ${readyMs}ms from process start (see docs/PERF.md)`)
  createMainWindow(mainWindowDeps)
})
