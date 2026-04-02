import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths'
import { createAuthHttpClient, type AuthHttpClient } from '@shared/api/auth-http-client'
import { createGuestsHttpClient, type GuestsHttpClient } from '@shared/api/guests-http-client'
import {
  formatEmbeddedApiUserMessage as formatEmbeddedApiUserMessageShared,
  normalizeEmbeddedApiBaseUrl,
} from '@shared/api/embedded-http'
import { createReservationsHttpClient, type ReservationsHttpClient } from '@shared/api/reservations-http-client'
import { createRoomsHttpClient, type RoomsHttpClient } from '@shared/api/rooms-http-client'
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
    readonly auth: AuthHttpClient
    readonly reservations: ReservationsHttpClient
    readonly guests: GuestsHttpClient
    readonly rooms: RoomsHttpClient
  }
  /** Stable user-visible copy from API/network errors (E5+ UI patterns). */
  formatEmbeddedApiUserMessage(error: unknown): string
}

function wrapFetchWithOptionalBearer(
  baseFetch: typeof fetch,
  baseUrl: string,
  getToken: () => string | null | undefined,
): typeof fetch {
  const normalized = normalizeEmbeddedApiBaseUrl(baseUrl)
  return (input, init) => {
    let url: string
    if (typeof input === 'string') {
      url = input
    } else if (input instanceof URL) {
      url = input.href
    } else {
      url = input.url
    }
    const needsBearer =
      url.startsWith(normalized) &&
      !url.includes('/api/auth/login') &&
      !url.includes('/health')
    const headers = new Headers(init?.headers)
    if (needsBearer) {
      const t = getToken()
      if (t) {
        headers.set('Authorization', `Bearer ${t}`)
      }
    }
    return baseFetch(input, { ...init, headers })
  }
}

export function createStarHotelApp(deps: {
  fetch: typeof fetch
  starHotel: StarHotelPreloadAPI
  /** When set, adds `Authorization: Bearer` for embedded API calls (except login + health). */
  getAuthToken?: () => string | null | undefined
}): StarHotelApp {
  const baseUrl = deps.starHotel.apiBaseUrl
  const rawFetch = deps.fetch
  const fetchFn = deps.getAuthToken
    ? wrapFetchWithOptionalBearer(rawFetch, baseUrl, deps.getAuthToken)
    : rawFetch

  const api = {
    auth: createAuthHttpClient({ baseUrl, fetch: fetchFn }),
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
      const res = await fetchFn(`${deps.starHotel.apiBaseUrl}${EMBEDDED_API_PATHS.health}`)
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
