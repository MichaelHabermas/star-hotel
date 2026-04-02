import { z } from 'zod'
import {
  roomListQuerySchema,
  roomResponseSchema,
  type RoomListQuery,
  type RoomResponse,
} from '../schemas/room'
import { createEmbeddedOpenApiClient } from './create-embedded-openapi-client'
import { throwIfOpenApiError } from './embedded-http'

function listQueryParams(query: RoomListQuery): { status?: string } | undefined {
  const parsed = roomListQuerySchema.parse(query)
  if (parsed.status === undefined) {
    return undefined
  }
  return { status: parsed.status }
}

export type RoomsHttpClient = {
  list(query?: RoomListQuery): Promise<RoomResponse[]>
  get(id: number): Promise<RoomResponse>
}

export function createRoomsHttpClient(deps: {
  readonly baseUrl: string
  readonly fetch: typeof fetch
}): RoomsHttpClient {
  const client = createEmbeddedOpenApiClient(deps)

  return {
    async list(query = {}) {
      const q = listQueryParams(query)
      const r = await client.GET('/api/rooms', {
        params: q ? { query: q } : {},
      })
      throwIfOpenApiError(r)
      return z.array(roomResponseSchema).parse(r.data)
    },

    async get(id) {
      const r = await client.GET('/api/rooms/{id}', {
        params: { path: { id } },
      })
      throwIfOpenApiError(r)
      return roomResponseSchema.parse(r.data)
    },
  }
}
