import { BrowserWindow } from 'electron'
import path from 'node:path'
import { resolvePreloadScript } from './preload-path'

export type MainWindowDeps = {
  readonly scriptDir: string
  readonly isDev: boolean
  readonly rendererUrl?: string
  /** Must match the embedded API listen URL (passed to preload via `additionalArguments`). */
  readonly apiBaseUrl: string
}

export function createMainWindow(deps: MainWindowDeps): BrowserWindow {
  const preloadPath = resolvePreloadScript(deps.scriptDir)

  const win = new BrowserWindow({
    width: 960,
    height: 720,
    show: false,
    webPreferences: {
      preload: preloadPath,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments: [`--star-hotel-api-base=${deps.apiBaseUrl}`],
    },
  })

  if (deps.isDev) {
    console.info('[main] preload path', preloadPath)
    win.webContents.on('did-fail-load', (_event, code, description, url) => {
      console.error('[main] did-fail-load', { code, description, url })
    })
    win.webContents.on('render-process-gone', (_event, details) => {
      console.error('[main] render-process-gone', details)
    })
    win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
      if (message.startsWith('[preload]') || message.startsWith('[renderer]')) {
        console.info('[renderer-console]', { level, message, line, sourceId })
      }
    })
  }

  win.once('ready-to-show', () => {
    win.show()
  })

  if (deps.isDev && deps.rendererUrl) {
    void win.loadURL(deps.rendererUrl)
  } else {
    void win.loadFile(path.join(deps.scriptDir, '../renderer/index.html'))
  }

  return win
}
