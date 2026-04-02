import { app, BrowserWindow } from 'electron';

/** Non-macOS: quit when all windows are closed. Safe to register at module load. */
export function registerWindowAllClosed(): void {
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

/**
 * macOS: re-create a window when the dock icon is clicked and no windows exist.
 * Register only after `app.whenReady()` and the first window has been created.
 */
export function registerActivateHandler(createMainWindow: () => void): void {
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
}
