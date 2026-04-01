import { describe, expect, it } from 'vitest'
import { starHotelPreloadBridgeSchema } from './preload-contract'

describe('starHotelPreloadBridgeSchema', () => {
  it('accepts a valid bridge payload', () => {
    const parsed = starHotelPreloadBridgeSchema.parse({ platform: 'darwin' })
    expect(parsed.platform).toBe('darwin')
  })

  it('rejects missing platform', () => {
    expect(() => starHotelPreloadBridgeSchema.parse({})).toThrow()
  })
})
