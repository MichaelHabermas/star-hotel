/**
 * Central registry for `ipcMain.handle` / `ipcRenderer.invoke` names.
 * Hotel domain data stays on Express; use IPC for native/Electron capabilities only.
 */
export const IPC_CHANNELS = {
  ping: 'star-hotel:ipc:ping',
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
