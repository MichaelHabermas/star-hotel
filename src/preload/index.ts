import { contextBridge } from 'electron'
import { starHotelPreloadBridgeSchema } from '@shared/preload-contract'

const api = starHotelPreloadBridgeSchema.parse({
  platform: process.platform,
})

contextBridge.exposeInMainWorld('starHotel', api)
