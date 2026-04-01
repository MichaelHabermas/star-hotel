import '@testing-library/jest-dom/vitest'
import { DEFAULT_API_PORT } from '@shared/constants'
import { starHotelPreloadBridgeSchema, type StarHotelPreloadAPI } from '@shared/preload-contract'

const bridge = starHotelPreloadBridgeSchema.parse({
  platform: 'test',
  apiBaseUrl: `http://127.0.0.1:${DEFAULT_API_PORT}`,
})

const starHotel: StarHotelPreloadAPI = {
  ...bridge,
  invoke: async () => ({}),
}

Object.defineProperty(window, 'starHotel', {
  configurable: true,
  value: starHotel,
})
