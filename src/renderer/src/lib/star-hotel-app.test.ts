import { describe, expect, it, vi } from 'vitest'
import { createStarHotelApp } from './star-hotel-app'

describe('createStarHotelApp', () => {
  it('ping succeeds when /health returns ok', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })
    const app = createStarHotelApp({
      fetch,
      starHotel: {
        platform: 'test',
        apiBaseUrl: 'http://127.0.0.1:45123',
      },
    })
    await expect(app.ping()).resolves.toEqual({ ok: true })
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:45123/health')
  })

  it('ping throws when response is not ok', async () => {
    const app = createStarHotelApp({
      fetch: vi.fn().mockResolvedValue({ ok: false, status: 500 }),
      starHotel: {
        platform: 'test',
        apiBaseUrl: 'http://127.0.0.1:45123',
      },
    })
    await expect(app.ping()).rejects.toThrow(/health check failed/)
  })
})
