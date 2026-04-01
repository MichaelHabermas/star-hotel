import { contextBridge, ipcRenderer } from 'electron'
import { buildApiBaseUrl, resolveApiPort } from '@shared/embedded-api-config'
import { IPC_CHANNELS, type IpcChannel } from '@shared/ipc/channels'
import { starHotelPreloadBridgeSchema, type StarHotelPreloadAPI } from '@shared/preload-contract'

const API_BASE_ARG_PREFIX = '--star-hotel-api-base='

const allowedIpcChannels = new Set<string>(Object.values(IPC_CHANNELS))

function readApiBaseUrlFromRendererArgv(): string {
  const hit = process.argv.find((a) => a.startsWith(API_BASE_ARG_PREFIX))
  if (hit) {
    return hit.slice(API_BASE_ARG_PREFIX.length)
  }
  return buildApiBaseUrl(resolveApiPort(process.env))
}

const bridge = starHotelPreloadBridgeSchema.parse({
  platform: process.platform,
  apiBaseUrl: readApiBaseUrlFromRendererArgv(),
})

function invoke(channel: IpcChannel, payload?: unknown): Promise<unknown> {
  if (!allowedIpcChannels.has(channel)) {
    return Promise.reject(new Error('IPC channel not allowed'))
  }
  return ipcRenderer.invoke(channel, payload)
}

const api: StarHotelPreloadAPI = {
  ...bridge,
  invoke,
}

contextBridge.exposeInMainWorld('starHotel', api)
