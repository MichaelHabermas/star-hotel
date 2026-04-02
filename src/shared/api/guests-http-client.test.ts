import { describe, expect, it, vi } from 'vitest'
import { createGuestsHttpClient } from './guests-http-client'

function requestUrl(input: RequestInfo | URL): string {
  return input instanceof Request ? input.url : String(input)
}

function jsonResponse(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    status: init?.status ?? 200,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
}

describe('createGuestsHttpClient', () => {
  it('lists guests', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(requestUrl(input)).toBe('http://127.0.0.1:1/api/guests')
      return jsonResponse([
        { id: 1, name: 'Ada', idNumber: null, contact: null },
      ])
    })

    const client = createGuestsHttpClient({
      baseUrl: 'http://127.0.0.1:1',
      fetch: fetchMock as typeof fetch,
    })

    const rows = await client.list()
    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe('Ada')
  })

  it('gets guest by id', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(requestUrl(input)).toBe('http://127.0.0.1:1/api/guests/2')
      return jsonResponse({ id: 2, name: 'Bob', idNumber: 'X', contact: 'c@x' })
    })

    const client = createGuestsHttpClient({
      baseUrl: 'http://127.0.0.1:1/',
      fetch: fetchMock as typeof fetch,
    })

    const row = await client.get(2)
    expect(row.id).toBe(2)
  })
})
