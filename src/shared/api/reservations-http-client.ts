import { z } from 'zod'
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

const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
})

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>

export class ReservationsHttpError extends Error {
  readonly name = 'ReservationsHttpError'

  constructor(
    readonly status: number,
    readonly body: ApiErrorBody,
  ) {
    super(body.error.message)
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '')
}

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

async function readErrorBody(res: Response): Promise<ApiErrorBody | undefined> {
  const text = await res.text()
  if (text === '') {
    return undefined
  }
  try {
    const json: unknown = JSON.parse(text)
    const parsed = apiErrorBodySchema.safeParse(json)
    return parsed.success ? parsed.data : undefined
  } catch {
    return undefined
  }
}

async function parseJsonOk<T>(res: Response, schema: z.ZodType<T>): Promise<T> {
  const json: unknown = await res.json()
  if (!res.ok) {
    const parsed = apiErrorBodySchema.safeParse(json)
    if (parsed.success) {
      throw new ReservationsHttpError(res.status, parsed.data)
    }
    throw new Error(`HTTP ${res.status}`)
  }
  return schema.parse(json)
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
  const base = normalizeBaseUrl(deps.baseUrl)
  const { fetch: fetchFn } = deps

  return {
    async list(query) {
      const qs = listQueryString(query)
      const res = await fetchFn(`${base}/api/reservations${qs}`)
      return parseJsonOk(res, z.array(reservationResponseSchema))
    },

    async get(id) {
      const res = await fetchFn(`${base}/api/reservations/${id}`)
      return parseJsonOk(res, reservationResponseSchema)
    },

    async create(body) {
      const payload = reservationCreateBodySchema.parse(body)
      const res = await fetchFn(`${base}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return parseJsonOk(res, reservationResponseSchema)
    },

    async update(id, body) {
      const payload = reservationUpdateBodySchema.parse(body)
      const res = await fetchFn(`${base}/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return parseJsonOk(res, reservationResponseSchema)
    },

    async delete(id) {
      const res = await fetchFn(`${base}/api/reservations/${id}`, { method: 'DELETE' })
      if (res.status === 204) {
        return
      }
      const err = await readErrorBody(res)
      if (err) {
        throw new ReservationsHttpError(res.status, err)
      }
      throw new Error(`HTTP ${res.status}`)
    },
  }
}
