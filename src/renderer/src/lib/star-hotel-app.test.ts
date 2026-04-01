import { ZodError } from 'zod'
import { describe, expect, it, vi } from 'vitest'
import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths'
import { IPC_CHANNELS } from '@shared/ipc/channels'
import type { StarHotelPreloadAPI } from '@shared/preload-contract'
import { createStarHotelApp } from './star-hotel-app'

function mockPreload(
  overrides: Partial<Pick<StarHotelPreloadAPI, 'invoke'>> = {},
): StarHotelPreloadAPI {
  return {
    platform: 'test',
    apiBaseUrl: 'http://127.0.0.1:45123',
    invoke: overrides.invoke ?? vi.fn(async () => ({ ok: true as const })),
  }
}

describe('createStarHotelApp', () => {
  it('pingEmbeddedApi succeeds when /health returns ok', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })
    const app = createStarHotelApp({
      fetch,
      starHotel: mockPreload(),
    })
    await expect(app.pingEmbeddedApi()).resolves.toEqual({ ok: true })
    expect(fetch).toHaveBeenCalledWith(`http://127.0.0.1:45123${EMBEDDED_API_PATHS.health}`)
  })

  it('pingEmbeddedApi throws when response is not ok', async () => {
    const app = createStarHotelApp({
      fetch: vi.fn().mockResolvedValue({ ok: false, status: 500 }),
      starHotel: mockPreload(),
    })
    await expect(app.pingEmbeddedApi()).rejects.toThrow(/health check failed/)
  })

  it('invoke delegates to preload bridge', async () => {
    const invoke = vi.fn().mockResolvedValue({ ok: true })
    const app = createStarHotelApp({
      fetch: vi.fn(),
      starHotel: mockPreload({ invoke }),
    })
    await expect(app.invoke(IPC_CHANNELS.ping)).resolves.toEqual({ ok: true })
    expect(invoke).toHaveBeenCalledWith(IPC_CHANNELS.ping, undefined)
  })

  it('pingIpc resolves when IPC returns ok', async () => {
    const app = createStarHotelApp({
      fetch: vi.fn(),
      starHotel: mockPreload(),
    })
    await expect(app.pingIpc()).resolves.toEqual({ ok: true })
  })

  it('pingIpc throws when IPC response fails Zod validation', async () => {
    const app = createStarHotelApp({
      fetch: vi.fn(),
      starHotel: mockPreload({
        invoke: vi.fn().mockResolvedValue({ ok: false }),
      }),
    })
    await expect(app.pingIpc()).rejects.toThrow(ZodError)
  })

  it('api.reservations.list uses embedded base URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    })
    const app = createStarHotelApp({
      fetch: fetchMock,
      starHotel: mockPreload(),
    })
    expect(app.api.reservations).toBeDefined()
    await app.api.reservations.list({})
    expect(fetchMock).toHaveBeenCalledWith(`http://127.0.0.1:45123${EMBEDDED_API_PATHS.reservations}`)
  })

  it('formatEmbeddedApiUserMessage delegates to shared helper', () => {
    const app = createStarHotelApp({
      fetch: vi.fn(),
      starHotel: mockPreload(),
    })
    expect(app.formatEmbeddedApiUserMessage(new Error('x'))).toBe('x')
  })
})
