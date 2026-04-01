import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc/channels'

/** Registers `ipcMain.handle` listeners. Domain APIs use Express; IPC is for native seams only. */
export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.ping, async () => ({ ok: true as const }))
}
