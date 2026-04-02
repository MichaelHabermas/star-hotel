import type { StarHotelApp } from '@renderer/lib/star-hotel-app';
import { vi } from 'vitest';

function mockApi() {
  return {
    auth: {
      login: vi.fn(),
      logout: vi.fn(),
      me: vi.fn(),
    },
    guests: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    rooms: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    reservations: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    reports: {
      getFolio: vi.fn(),
      getDaySheet: vi.fn(),
    },
  };
}

/**
 * Vitest-mocked `StarHotelApp` for RTL tests. Configure via `app.api.*.mockResolvedValue` / `mockImplementation`.
 */
export function createMockStarHotelApp() {
  const api = mockApi();
  return {
    getEnvironment: () => ({ platform: 'darwin', apiBaseUrl: 'http://127.0.0.1:45123' }),
    invoke: vi.fn(),
    pingEmbeddedApi: vi.fn().mockResolvedValue({ ok: true }),
    pingIpc: vi.fn().mockResolvedValue({ ok: true }),
    api,
    formatEmbeddedApiUserMessage: (err: unknown) =>
      err instanceof Error ? err.message : String(err),
  };
}

export type MockStarHotelApp = ReturnType<typeof createMockStarHotelApp>;

/** Satisfies `StarHotelAppProvider` while keeping Vitest mock methods on the same object. */
export function asStarHotelApp(mock: MockStarHotelApp): StarHotelApp {
  return mock as unknown as StarHotelApp;
}
