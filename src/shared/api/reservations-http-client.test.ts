import { describe, expect, it, vi } from 'vitest'
import { ReservationsHttpError, createReservationsHttpClient } from './reservations-http-client'

function jsonResponse(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    status: init?.status ?? 200,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
}

describe('createReservationsHttpClient', () => {
  it('lists reservations with query string', async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      expect(String(url)).toBe('http://127.0.0.1:1/api/reservations?roomId=2')
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

  it('throws ReservationsHttpError on API error JSON', async () => {
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
      name: 'ReservationsHttpError',
      status: 404,
    })

    try {
      await client.get(9)
    } catch (e) {
      expect(e).toBeInstanceOf(ReservationsHttpError)
      if (e instanceof ReservationsHttpError) {
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
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:1/api/reservations/1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})
