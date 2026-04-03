import { describe, expect, it } from 'vitest';
import {
  embeddedApiPathnameExemptFromBearer,
  shouldAttachBearerToEmbeddedApiUrl,
} from './embedded-api-public-access';

describe('embeddedApiPathnameExemptFromBearer', () => {
  it.each([
    ['/health', true],
    ['/api/openapi.json', true],
    ['/api/openapi', true],
    ['/api/docs', true],
    ['/api/auth', false],
    ['/api/auth/login', true],
    ['/api/auth/logout', false],
    ['/api/auth/me', false],
    ['/api/auth/change-password', false],
    ['/api/guests', false],
    ['/api/rooms', false],
    ['/api/reports/folio', false],
  ])('%s -> %s', (pathname, expected) => {
    expect(embeddedApiPathnameExemptFromBearer(pathname)).toBe(expected);
  });
});

describe('shouldAttachBearerToEmbeddedApiUrl', () => {
  const base = 'http://127.0.0.1:18443';

  it('returns false when URL is not under base', () => {
    expect(shouldAttachBearerToEmbeddedApiUrl('https://evil.test/api/guests', base)).toBe(false);
  });

  it.each([
    ['http://127.0.0.1:18443/health', false],
    ['http://127.0.0.1:18443/api/openapi.json', false],
    ['http://127.0.0.1:18443/api/docs', false],
    ['http://127.0.0.1:18443/api/auth/login', false],
    ['http://127.0.0.1:18443/api/auth/me', true],
    ['http://127.0.0.1:18443/api/auth/change-password', true],
    ['http://127.0.0.1:18443/api/guests', true],
    ['http://127.0.0.1:18443/api/guests?x=1', true],
  ])('%s -> attach=%s', (url, attach) => {
    expect(shouldAttachBearerToEmbeddedApiUrl(url, base)).toBe(attach);
  });

  it('normalizes trailing slash on base', () => {
    expect(
      shouldAttachBearerToEmbeddedApiUrl('http://127.0.0.1:18443/api/reservations', `${base}/`),
    ).toBe(true);
  });
});
