import { contextBridge, ipcRenderer } from 'electron'
import type { IpcChannel } from '@shared/ipc/channels'
import type { StarHotelPreloadAPI } from '@shared/preload-contract'

const API_BASE_ARG_PREFIX = '--star-hotel-api-base='
const DEFAULT_API_PORT = 45123
const STAR_HOTEL_PORT_ENV = 'STAR_HOTEL_PORT'
const IPC_PING_CHANNEL = 'star-hotel:ipc:ping'
const FALLBACK_PLATFORM = 'unknown'

const allowedIpcChannels = new Set<string>([IPC_PING_CHANNEL])
const maybeProcess = typeof process !== 'undefined' ? process : undefined

function readApiBaseUrlFromRendererArgv(): string {
  const argv = Array.isArray(maybeProcess?.argv) ? maybeProcess.argv : []
  const apiBaseArg = argv.find((arg) => arg.startsWith(API_BASE_ARG_PREFIX))
  if (apiBaseArg) {
    return apiBaseArg.slice(API_BASE_ARG_PREFIX.length)
  }

  const envPort = Number((maybeProcess?.env ?? {})[STAR_HOTEL_PORT_ENV])
  const port = Number.isFinite(envPort) && envPort > 0 ? envPort : DEFAULT_API_PORT
  return `http://127.0.0.1:${port}`
}

const bridge = {
  platform: maybeProcess?.platform ?? FALLBACK_PLATFORM,
  apiBaseUrl: readApiBaseUrlFromRendererArgv(),
} as const

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

console.info('[preload] bridge bootstrap start', {
  platform: bridge.platform,
  apiBaseUrl: bridge.apiBaseUrl,
})
contextBridge.exposeInMainWorld('starHotel', api)
console.info('[preload] bridge exposed')
