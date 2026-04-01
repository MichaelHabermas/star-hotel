import { app, BrowserWindow } from 'electron'

/**
 * macOS re-creates a window when the dock icon is clicked and no windows exist.
 * Other platforms quit when all windows close.
 */
export function registerWindowLifecycle(createMainWindow: () => void): void {
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}
