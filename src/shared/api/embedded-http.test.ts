import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  EmbeddedApiHttpError,
  formatEmbeddedApiUserMessage,
  parseEmbeddedJsonOk,
  throwIfOpenApiError,
} from './embedded-http'

describe('formatEmbeddedApiUserMessage', () => {
  it('uses API error message when available', () => {
    const err = new EmbeddedApiHttpError(400, {
      error: { code: 'BAD', message: 'Invalid dates' },
    })
    expect(formatEmbeddedApiUserMessage(err)).toBe('Invalid dates')
  })

  it('falls back for generic Error', () => {
    expect(formatEmbeddedApiUserMessage(new Error('Network down'))).toBe('Network down')
  })

  it('falls back for unknown', () => {
    expect(formatEmbeddedApiUserMessage('x')).toBe('Something went wrong. Please try again.')
  })
})

describe('parseEmbeddedJsonOk', () => {
  it('parses ok JSON with schema', async () => {
    const res = new Response(JSON.stringify({ foo: 1 }), { status: 200 })
    await expect(parseEmbeddedJsonOk(res, z.object({ foo: z.number() }))).resolves.toEqual({
      foo: 1,
    })
  })

  it('throws EmbeddedApiHttpError when error body matches API schema', async () => {
    const body = JSON.stringify({
      error: { code: 'BAD_REQUEST', message: 'Invalid dates' },
    })
    const res = new Response(body, { status: 400 })
    await expect(parseEmbeddedJsonOk(res, z.object({}))).rejects.toSatisfy(
      (e: unknown) =>
        e instanceof EmbeddedApiHttpError &&
        e.status === 400 &&
        e.body.error.message === 'Invalid dates',
    )
  })

  it('does not throw from JSON parse on non-JSON error body; throws HTTP error instead', async () => {
    const res = new Response('Internal Server Error', { status: 500 })
    await expect(parseEmbeddedJsonOk(res, z.object({}))).rejects.toThrow('HTTP 500')
  })

  it('handles HTML error body without unhandled rejection', async () => {
    const res = new Response('<html><body>Error</body></html>', { status: 502 })
    await expect(parseEmbeddedJsonOk(res, z.object({}))).rejects.toThrow('HTTP 502')
  })

  it('handles empty error body', async () => {
    const res = new Response('', { status: 503 })
    await expect(parseEmbeddedJsonOk(res, z.object({}))).rejects.toThrow('HTTP 503')
  })

  it('throws clear error when ok response is not JSON', async () => {
    const res = new Response('not json', { status: 200 })
    await expect(parseEmbeddedJsonOk(res, z.object({}))).rejects.toThrow(
      'Invalid JSON response (HTTP 200)',
    )
  })
})

describe('throwIfOpenApiError', () => {
  it('no-ops when response is ok', () => {
    expect(() =>
      throwIfOpenApiError({
        response: new Response(null, { status: 200 }),
        error: undefined,
      }),
    ).not.toThrow()
  })

  it('throws EmbeddedApiHttpError when error matches API body shape', () => {
    expect(() =>
      throwIfOpenApiError({
        response: new Response(null, { status: 404 }),
        error: { error: { code: 'NOT_FOUND', message: 'missing' } },
      }),
    ).toThrow(EmbeddedApiHttpError)
  })
})
