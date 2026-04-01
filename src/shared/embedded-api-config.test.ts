import { describe, expect, it } from 'vitest'
import { DEFAULT_API_PORT } from './constants'
import { buildApiBaseUrl, resolveApiPort } from './embedded-api-config'

describe('resolveApiPort', () => {
  it('uses STAR_HOTEL_PORT when set to a positive number', () => {
    expect(resolveApiPort({ STAR_HOTEL_PORT: '8080' })).toBe(8080)
  })

  it('falls back when env is missing or empty', () => {
    expect(resolveApiPort({})).toBe(DEFAULT_API_PORT)
    expect(resolveApiPort({ STAR_HOTEL_PORT: '' })).toBe(DEFAULT_API_PORT)
  })

  it('falls back when value is not a usable port number', () => {
    expect(resolveApiPort({ STAR_HOTEL_PORT: 'not-a-number' })).toBe(DEFAULT_API_PORT)
  })
})

describe('buildApiBaseUrl', () => {
  it('formats loopback URL with the given port', () => {
    expect(buildApiBaseUrl(45123)).toBe('http://127.0.0.1:45123')
  })
})
