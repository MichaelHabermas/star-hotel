import type { StarHotelPreloadAPI } from '../preload-contract'
import { IPC_CHANNELS } from './channels'
import { type IpcPingResponse, ipcPingResponseSchema } from './ipc-ping'

export async function invokeIpcPing(
  api: Pick<StarHotelPreloadAPI, 'invoke'>,
): Promise<IpcPingResponse> {
  const raw = await api.invoke(IPC_CHANNELS.ping)
  return ipcPingResponseSchema.parse(raw)
}
