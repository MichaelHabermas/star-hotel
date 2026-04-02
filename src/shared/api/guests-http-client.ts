import { z } from 'zod'
import {
  guestListQuerySchema,
  guestResponseSchema,
  type GuestListQuery,
  type GuestResponse,
} from '../schemas/guest'
import { createEmbeddedOpenApiClient } from './create-embedded-openapi-client'
import { throwIfOpenApiError } from './embedded-http'

export type GuestsHttpClient = {
  list(query?: GuestListQuery): Promise<GuestResponse[]>
  get(id: number): Promise<GuestResponse>
}

export function createGuestsHttpClient(deps: {
  readonly baseUrl: string
  readonly fetch: typeof fetch
}): GuestsHttpClient {
  const client = createEmbeddedOpenApiClient(deps)

  return {
    async list(query = {}) {
      guestListQuerySchema.parse(query)
      const r = await client.GET('/api/guests', {})
      throwIfOpenApiError(r)
      return z.array(guestResponseSchema).parse(r.data)
    },

    async get(id) {
      const r = await client.GET('/api/guests/{id}', {
        params: { path: { id } },
      })
      throwIfOpenApiError(r)
      return guestResponseSchema.parse(r.data)
    },
  }
}
