import { createGuestsHttpClient, type GuestsHttpClient } from '@shared/api/guests-http-client'
import { createReservationsHttpClient, type ReservationsHttpClient } from '@shared/api/reservations-http-client'
import { createRoomsHttpClient, type RoomsHttpClient } from '@shared/api/rooms-http-client'
import { formatEmbeddedApiUserMessage as formatEmbeddedApiUserMessageShared } from '@shared/api/embedded-http'
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
  /** Typed HTTP clients for the embedded Express API (localhost); all domain reads/writes go here. */
  readonly api: {
    readonly reservations: ReservationsHttpClient
    readonly guests: GuestsHttpClient
    readonly rooms: RoomsHttpClient
  }
  /** Stable user-visible copy from API/network errors (E5+ UI patterns). */
  formatEmbeddedApiUserMessage(error: unknown): string
}

export function createStarHotelApp(deps: {
  fetch: typeof fetch
  starHotel: StarHotelPreloadAPI
}): StarHotelApp {
  const baseUrl = deps.starHotel.apiBaseUrl
  const fetchFn = deps.fetch

  const api = {
    reservations: createReservationsHttpClient({ baseUrl, fetch: fetchFn }),
    guests: createGuestsHttpClient({ baseUrl, fetch: fetchFn }),
    rooms: createRoomsHttpClient({ baseUrl, fetch: fetchFn }),
  } as const

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
    api,
    formatEmbeddedApiUserMessage(error: unknown) {
      return formatEmbeddedApiUserMessageShared(error)
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
