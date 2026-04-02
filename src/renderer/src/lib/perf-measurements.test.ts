import { describe, expect, it, vi } from 'vitest'
import { runPerfSmoke } from './perf-measurements'
import type { StarHotelApp } from './star-hotel-app'

describe('runPerfSmoke', () => {
  it('returns three non-negative timings', async () => {
    const starHotel = {
      pingEmbeddedApi: vi.fn(async () => {}),
      pingIpc: vi.fn(async () => {}),
      api: {
        reservations: {
          list: vi.fn(async () => []),
        },
      },
    } as unknown as StarHotelApp

    const result = await runPerfSmoke(starHotel)

    expect(result.embeddedApiRttMs).toBeGreaterThanOrEqual(0)
    expect(result.ipcRttMs).toBeGreaterThanOrEqual(0)
    expect(result.reservationListMs).toBeGreaterThanOrEqual(0)
    expect(starHotel.pingEmbeddedApi).toHaveBeenCalledTimes(1)
    expect(starHotel.pingIpc).toHaveBeenCalledTimes(1)
    expect(starHotel.api.reservations.list).toHaveBeenCalledWith({})
  })
})
