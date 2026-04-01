import { contextBridge } from 'electron'
import { DEFAULT_API_PORT } from '@shared/constants'
import { starHotelPreloadBridgeSchema } from '@shared/preload-contract'

const API_BASE_ARG_PREFIX = '--star-hotel-api-base='

function readApiBaseUrlFromRendererArgv(): string {
  const hit = process.argv.find((a) => a.startsWith(API_BASE_ARG_PREFIX))
  if (hit) {
    return hit.slice(API_BASE_ARG_PREFIX.length)
  }
  return `http://127.0.0.1:${DEFAULT_API_PORT}`
}

const api = starHotelPreloadBridgeSchema.parse({
  platform: process.platform,
  apiBaseUrl: readApiBaseUrlFromRendererArgv(),
})

contextBridge.exposeInMainWorld('starHotel', api)
