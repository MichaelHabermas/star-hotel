import { z } from 'zod'
import { throwIfOpenApiError } from './embedded-http'
import { createEmbeddedOpenApiClient } from './create-embedded-openapi-client'
import {
  reservationCreateBodySchema,
  reservationListQuerySchema,
  reservationResponseSchema,
  reservationUpdateBodySchema,
  type ReservationCreateBody,
  type ReservationListQuery,
  type ReservationResponse,
  type ReservationUpdateBody,
} from '../schemas/reservation'

export { EmbeddedApiHttpError as ReservationsHttpError } from './embedded-http'
export type { EmbeddedApiErrorBody as ApiErrorBody } from './embedded-http'

function listQueryParams(query: ReservationListQuery): { roomId?: number; guestId?: number } {
  const parsed = reservationListQuerySchema.parse(query)
  const out: { roomId?: number; guestId?: number } = {}
  if (parsed.roomId !== undefined) {
    out.roomId = parsed.roomId
  }
  if (parsed.guestId !== undefined) {
    out.guestId = parsed.guestId
  }
  return out
}

export type ReservationsHttpClient = {
  list(query: ReservationListQuery): Promise<ReservationResponse[]>
  get(id: number): Promise<ReservationResponse>
  create(body: ReservationCreateBody): Promise<ReservationResponse>
  update(id: number, body: ReservationUpdateBody): Promise<ReservationResponse>
  delete(id: number): Promise<void>
}

export function createReservationsHttpClient(deps: {
  readonly baseUrl: string
  readonly fetch: typeof fetch
}): ReservationsHttpClient {
  const client = createEmbeddedOpenApiClient(deps)

  return {
    async list(query) {
      const q = listQueryParams(query)
      const r = await client.GET('/api/reservations', {
        params: Object.keys(q).length > 0 ? { query: q } : {},
      })
      throwIfOpenApiError(r)
      return z.array(reservationResponseSchema).parse(r.data)
    },

    async get(id) {
      const r = await client.GET('/api/reservations/{id}', {
        params: { path: { id } },
      })
      throwIfOpenApiError(r)
      return reservationResponseSchema.parse(r.data)
    },

    async create(body) {
      const payload = reservationCreateBodySchema.parse(body)
      const r = await client.POST('/api/reservations', {
        body: payload,
      })
      throwIfOpenApiError(r)
      return reservationResponseSchema.parse(r.data)
    },

    async update(id, body) {
      const payload = reservationUpdateBodySchema.parse(body)
      const r = await client.PATCH('/api/reservations/{id}', {
        params: { path: { id } },
        body: payload,
      })
      throwIfOpenApiError(r)
      return reservationResponseSchema.parse(r.data)
    },

    async delete(id) {
      const r = await client.DELETE('/api/reservations/{id}', {
        params: { path: { id } },
      })
      if (r.response.status === 204) {
        return
      }
      throwIfOpenApiError(r)
    },
  }
}
