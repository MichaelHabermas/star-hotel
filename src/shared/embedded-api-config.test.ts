import { describe, expect, it } from 'vitest';
import { DEFAULT_API_PORT } from './constants';
import {
  API_BASE_ARG_PREFIX,
  buildApiBaseUrl,
  readRendererEmbeddedApiBaseUrl,
  resolveApiPort,
  resolveApiPortFromEnv,
} from './embedded-api-config';

describe('resolveApiPortFromEnv', () => {
  it('uses STAR_HOTEL_PORT when set to a valid port', () => {
    expect(resolveApiPortFromEnv({ STAR_HOTEL_PORT: '8080' })).toBe(8080);
    expect(resolveApiPortFromEnv({ STAR_HOTEL_PORT: '1' })).toBe(1);
    expect(resolveApiPortFromEnv({ STAR_HOTEL_PORT: '65535' })).toBe(65535);
  });

  it('falls back when env is missing or empty', () => {
    expect(resolveApiPortFromEnv({})).toBe(DEFAULT_API_PORT);
    expect(resolveApiPortFromEnv({ STAR_HOTEL_PORT: '' })).toBe(DEFAULT_API_PORT);
  });

  it('falls back when value is not a usable port number', () => {
    expect(resolveApiPortFromEnv({ STAR_HOTEL_PORT: 'not-a-number' })).toBe(DEFAULT_API_PORT);
    expect(resolveApiPortFromEnv({ STAR_HOTEL_PORT: '8080.5' })).toBe(DEFAULT_API_PORT);
  });

  it('falls back for out-of-range or non-positive ports', () => {
    expect(resolveApiPortFromEnv({ STAR_HOTEL_PORT: '0' })).toBe(DEFAULT_API_PORT);
    expect(resolveApiPortFromEnv({ STAR_HOTEL_PORT: '-1' })).toBe(DEFAULT_API_PORT);
    expect(resolveApiPortFromEnv({ STAR_HOTEL_PORT: '65536' })).toBe(DEFAULT_API_PORT);
  });
});

describe('resolveApiPort', () => {
  it('matches resolveApiPortFromEnv', () => {
    expect(resolveApiPort({ STAR_HOTEL_PORT: '9000' })).toBe(9000);
  });
});

describe('buildApiBaseUrl', () => {
  it('formats loopback URL with the given port', () => {
    expect(buildApiBaseUrl(45123)).toBe('http://127.0.0.1:45123');
  });
});

describe('readRendererEmbeddedApiBaseUrl', () => {
  it('uses argv override when --star-hotel-api-base= is present', () => {
    const url = 'http://127.0.0.1:9999';
    expect(
      readRendererEmbeddedApiBaseUrl([`${API_BASE_ARG_PREFIX}${url}`], { STAR_HOTEL_PORT: '8080' }),
    ).toBe(url);
  });

  it('uses env port when argv override is absent', () => {
    expect(readRendererEmbeddedApiBaseUrl([], { STAR_HOTEL_PORT: '8080' })).toBe(
      'http://127.0.0.1:8080',
    );
  });

  it('falls back to default port when env is empty', () => {
    expect(readRendererEmbeddedApiBaseUrl([], {})).toBe(buildApiBaseUrl(DEFAULT_API_PORT));
  });
});
