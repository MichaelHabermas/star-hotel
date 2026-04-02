import { describe, expect, it, vi } from 'vitest'
import { EmbeddedApiHttpError } from './embedded-http'
import { createReservationsHttpClient } from './reservations-http-client'

function requestUrl(input: RequestInfo | URL): string {
  return input instanceof Request ? input.url : String(input)
}

function jsonResponse(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    status: init?.status ?? 200,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
}

describe('createReservationsHttpClient', () => {
  it('lists reservations with query string', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(requestUrl(input)).toBe('http://127.0.0.1:1/api/reservations?roomId=2')
      return jsonResponse([
        {
          id: 1,
          roomId: 2,
          guestId: 3,
          checkInDate: '2026-01-01',
          checkOutDate: '2026-01-03',
          totalAmount: 200,
        },
      ])
    })

    const client = createReservationsHttpClient({
      baseUrl: 'http://127.0.0.1:1/',
      fetch: fetchMock as typeof fetch,
    })

    const rows = await client.list({ roomId: 2 })
    expect(rows).toHaveLength(1)
    expect(rows[0].totalAmount).toBe(200)
  })

  it('throws EmbeddedApiHttpError on API error JSON', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(
        { error: { code: 'NOT_FOUND', message: 'Reservation 9 not found' } },
        { status: 404 },
      ),
    )

    const client = createReservationsHttpClient({
      baseUrl: 'http://127.0.0.1:1',
      fetch: fetchMock as typeof fetch,
    })

    await expect(client.get(9)).rejects.toMatchObject({
      name: 'EmbeddedApiHttpError',
      status: 404,
    })

    try {
      await client.get(9)
    } catch (e) {
      expect(e).toBeInstanceOf(EmbeddedApiHttpError)
      if (e instanceof EmbeddedApiHttpError) {
        expect(e.body.error.code).toBe('NOT_FOUND')
      }
    }
  })

  it('delete resolves on 204', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }))
    const client = createReservationsHttpClient({
      baseUrl: 'http://127.0.0.1:1',
      fetch: fetchMock as typeof fetch,
    })
    await expect(client.delete(1)).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const calls = fetchMock.mock.calls as unknown as [[Request]]
    const req = calls[0][0]
    expect(req).toBeInstanceOf(Request)
    expect(req.url).toBe('http://127.0.0.1:1/api/reservations/1')
    expect(req.method).toBe('DELETE')
  })
})
