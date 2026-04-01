import { BrowserWindow, app } from 'electron'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function resolvePreloadScript(): string {
  const asJs = path.join(__dirname, '../preload/index.js')
  const asMjs = path.join(__dirname, '../preload/index.mjs')
  if (existsSync(asMjs)) {
    return asMjs
  }
  return asJs
}

const isDev = !app.isPackaged
const appStartMs = Date.now()

function createWindow(): void {
  const win = new BrowserWindow({
    width: 960,
    height: 720,
    show: false,
    webPreferences: {
      preload: resolvePreloadScript(),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  const readyMs = Date.now() - appStartMs
  console.log(`[star-hotel] app.whenReady() + ${readyMs}ms from process start (see docs/PERF.md)`)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
