import type { StarHotelPreloadAPI } from '@shared/preload-contract';
import { describe, expect, it, vi } from 'vitest';
import { createRendererStarHotelApp } from './create-renderer-star-hotel-app';

describe('createRendererStarHotelApp', () => {
  it('builds StarHotelApp with injected fetch and auth bridge', () => {
    const fetchImpl = vi.fn();
    const bridge: StarHotelPreloadAPI = {
      platform: 'test',
      apiBaseUrl: 'http://127.0.0.1:45123',
      invoke: vi.fn(),
    };
    const app = createRendererStarHotelApp({
      starHotel: bridge,
      getAuthToken: () => null,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(app.api.auth).toBeDefined();
    expect(app.api.reservations).toBeDefined();
  });
});
