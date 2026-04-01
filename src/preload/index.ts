import { contextBridge } from 'electron'
import type { StarHotelPreloadAPI } from '@shared/preload-contract'

const api: StarHotelPreloadAPI = {
  platform: process.platform,
}

contextBridge.exposeInMainWorld('starHotel', api)
