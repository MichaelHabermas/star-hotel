import { z } from 'zod'
import { normalizeEmbeddedApiBaseUrl, parseEmbeddedJsonOk } from './embedded-http'
import {
  guestListQuerySchema,
  guestResponseSchema,
  type GuestListQuery,
  type GuestResponse,
} from '../schemas/guest'

function listQueryString(query: GuestListQuery): string {
  guestListQuerySchema.parse(query)
  return ''
}

export type GuestsHttpClient = {
  list(query?: GuestListQuery): Promise<GuestResponse[]>
  get(id: number): Promise<GuestResponse>
}

export function createGuestsHttpClient(deps: {
  readonly baseUrl: string
  readonly fetch: typeof fetch
}): GuestsHttpClient {
  const base = normalizeEmbeddedApiBaseUrl(deps.baseUrl)
  const { fetch: fetchFn } = deps

  return {
    async list(query = {}) {
      const qs = listQueryString(query)
      const res = await fetchFn(`${base}/api/guests${qs}`)
      return parseEmbeddedJsonOk(res, z.array(guestResponseSchema))
    },

    async get(id) {
      const res = await fetchFn(`${base}/api/guests/${id}`)
      return parseEmbeddedJsonOk(res, guestResponseSchema)
    },
  }
}
