import { describe, expect, it } from 'vitest'
import { EmbeddedApiHttpError, formatEmbeddedApiUserMessage } from './embedded-http'

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
