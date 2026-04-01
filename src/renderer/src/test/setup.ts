import '@testing-library/jest-dom/vitest'
import { DEFAULT_API_PORT } from '@shared/constants'
import { starHotelPreloadBridgeSchema } from '@shared/preload-contract'

Object.defineProperty(window, 'starHotel', {
  configurable: true,
  value: starHotelPreloadBridgeSchema.parse({
    platform: 'test',
    apiBaseUrl: `http://127.0.0.1:${DEFAULT_API_PORT}`,
  }),
})
