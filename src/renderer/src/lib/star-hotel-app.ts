import type { StarHotelPreloadAPI } from '@shared/preload-contract'

/** Renderer port for app data: preload bridge + embedded API (Dependency Inversion). */
export type StarHotelApp = {
  getEnvironment(): Pick<StarHotelPreloadAPI, 'platform' | 'apiBaseUrl'>
  /** Verifies the embedded Express API responds on `/health`. */
  ping(): Promise<{ ok: true }>
}

export function createStarHotelApp(deps: {
  fetch: typeof fetch
  starHotel: StarHotelPreloadAPI
}): StarHotelApp {
  return {
    getEnvironment() {
      return {
        platform: deps.starHotel.platform,
        apiBaseUrl: deps.starHotel.apiBaseUrl,
      }
    },
    async ping() {
      const res = await deps.fetch(`${deps.starHotel.apiBaseUrl}/health`)
      if (!res.ok) {
        throw new Error(`health check failed: HTTP ${res.status}`)
      }
      const body = (await res.json()) as { ok?: unknown }
      if (body.ok !== true) {
        throw new Error('health response invalid')
      }
      return { ok: true as const }
    },
  }
}
