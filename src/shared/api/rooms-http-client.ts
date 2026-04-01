import { z } from 'zod'
import { normalizeEmbeddedApiBaseUrl, parseEmbeddedJsonOk } from './embedded-http'
import {
  roomListQuerySchema,
  roomResponseSchema,
  type RoomListQuery,
  type RoomResponse,
} from '../schemas/room'

function listQueryString(query: RoomListQuery): string {
  const parsed = roomListQuerySchema.parse(query)
  const p = new URLSearchParams()
  if (parsed.status !== undefined) {
    p.set('status', parsed.status)
  }
  const s = p.toString()
  return s === '' ? '' : `?${s}`
}

export type RoomsHttpClient = {
  list(query?: RoomListQuery): Promise<RoomResponse[]>
  get(id: number): Promise<RoomResponse>
}

export function createRoomsHttpClient(deps: {
  readonly baseUrl: string
  readonly fetch: typeof fetch
}): RoomsHttpClient {
  const base = normalizeEmbeddedApiBaseUrl(deps.baseUrl)
  const { fetch: fetchFn } = deps

  return {
    async list(query = {}) {
      const qs = listQueryString(query)
      const res = await fetchFn(`${base}/api/rooms${qs}`)
      return parseEmbeddedJsonOk(res, z.array(roomResponseSchema))
    },

    async get(id) {
      const res = await fetchFn(`${base}/api/rooms/${id}`)
      return parseEmbeddedJsonOk(res, roomResponseSchema)
    },
  }
}
