import type { IpcChannel } from '@shared/ipc/channels'
import { invokeIpcPing } from '@shared/ipc/typed-invoke'
import type { StarHotelPreloadAPI } from '@shared/preload-contract'

/** Renderer port: preload bridge + embedded API (dependency inversion — avoid `window` in features). */
export type StarHotelApp = {
  getEnvironment(): Pick<StarHotelPreloadAPI, 'platform' | 'apiBaseUrl'>
  /** Typed IPC to main; domain data stays on Express (see channel registry in `ipc/channels`). */
  invoke(channel: IpcChannel, payload?: unknown): Promise<unknown>
  /** Embedded Express API is up (HTTP GET `/health`). */
  pingEmbeddedApi(): Promise<{ ok: true }>
  /** Main process IPC bridge responds (native/Electron seam). */
  pingIpc(): Promise<{ ok: true }>
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
    invoke(channel, payload) {
      return deps.starHotel.invoke(channel, payload)
    },
    async pingEmbeddedApi() {
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
    async pingIpc() {
      return invokeIpcPing(deps.starHotel)
    },
  }
}
