import { z } from 'zod'
import {
  normalizeEmbeddedApiBaseUrl,
  parseEmbeddedJsonOk,
  readEmbeddedApiErrorBody,
  EmbeddedApiHttpError,
} from './embedded-http'
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

function listQueryString(query: ReservationListQuery): string {
  const parsed = reservationListQuerySchema.parse(query)
  const p = new URLSearchParams()
  if (parsed.roomId !== undefined) {
    p.set('roomId', String(parsed.roomId))
  }
  if (parsed.guestId !== undefined) {
    p.set('guestId', String(parsed.guestId))
  }
  const s = p.toString()
  return s === '' ? '' : `?${s}`
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
  const base = normalizeEmbeddedApiBaseUrl(deps.baseUrl)
  const { fetch: fetchFn } = deps

  return {
    async list(query) {
      const qs = listQueryString(query)
      const res = await fetchFn(`${base}/api/reservations${qs}`)
      return parseEmbeddedJsonOk(res, z.array(reservationResponseSchema))
    },

    async get(id) {
      const res = await fetchFn(`${base}/api/reservations/${id}`)
      return parseEmbeddedJsonOk(res, reservationResponseSchema)
    },

    async create(body) {
      const payload = reservationCreateBodySchema.parse(body)
      const res = await fetchFn(`${base}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return parseEmbeddedJsonOk(res, reservationResponseSchema)
    },

    async update(id, body) {
      const payload = reservationUpdateBodySchema.parse(body)
      const res = await fetchFn(`${base}/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return parseEmbeddedJsonOk(res, reservationResponseSchema)
    },

    async delete(id) {
      const res = await fetchFn(`${base}/api/reservations/${id}`, { method: 'DELETE' })
      if (res.status === 204) {
        return
      }
      const err = await readEmbeddedApiErrorBody(res)
      if (err) {
        throw new EmbeddedApiHttpError(res.status, err)
      }
      throw new Error(`HTTP ${res.status}`)
    },
  }
}
