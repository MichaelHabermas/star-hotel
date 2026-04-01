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
  const win = new BrowserWindow({
    width: 960,
    height: 720,
    show: false,
    webPreferences: {
      preload: resolvePreloadScript(deps.scriptDir),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments: [`--star-hotel-api-base=${deps.apiBaseUrl}`],
    },
  })

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
