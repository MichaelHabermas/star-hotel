import { asStarHotelApp, createMockStarHotelApp } from '@renderer/test-utils/mock-star-hotel-app';
import { describe, expect, it } from 'vitest';
import { runPerfSmoke } from './perf-measurements';

describe('runPerfSmoke', () => {
  it('returns three non-negative timings', async () => {
    const starHotel = createMockStarHotelApp();
    starHotel.pingEmbeddedApi.mockImplementation(async () => {});
    starHotel.pingIpc.mockImplementation(async () => {});
    starHotel.api.reservations.list.mockImplementation(async () => []);

    const result = await runPerfSmoke(asStarHotelApp(starHotel));

    expect(result.embeddedApiRttMs).toBeGreaterThanOrEqual(0);
    expect(result.ipcRttMs).toBeGreaterThanOrEqual(0);
    expect(result.reservationListMs).toBeGreaterThanOrEqual(0);
    expect(starHotel.pingEmbeddedApi).toHaveBeenCalledTimes(1);
    expect(starHotel.pingIpc).toHaveBeenCalledTimes(1);
    expect(starHotel.api.reservations.list).toHaveBeenCalledWith({});
  });
});
