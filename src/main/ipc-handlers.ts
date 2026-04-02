import { IPC_CHANNELS } from '@shared/ipc/channels';
import { ipcMain } from 'electron';
import type { PersistencePort } from '../server/ports/persistence';

export type RegisterIpcHandlersDeps = {
  /** Must return the same persistence instance used by the embedded Express app. */
  getPersistence: () => PersistencePort;
};

/** Registers `ipcMain.handle` listeners. Domain APIs use Express; IPC is for native seams only. */
export function registerIpcHandlers(deps: RegisterIpcHandlersDeps): void {
  ipcMain.handle(IPC_CHANNELS.ping, async () => {
    await deps.getPersistence().isReady();
    return { ok: true as const };
  });
}
