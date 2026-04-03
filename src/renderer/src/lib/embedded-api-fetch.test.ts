import { EMBEDDED_API_PATHS } from '@shared/api/embedded-api-paths';
import { HOTEL_MODULE_KEYS } from '@shared/hotel-modules';
import { describe, expect, it, vi } from 'vitest';
import {
  headersForEmbeddedApiFetchMerge,
  wrapFetchWithOptionalEmbeddedApiBearer,
} from './embedded-api-fetch';

const baseUrl = 'http://127.0.0.1:45123';

describe('embedded-api fetch transport', () => {
  it('wrapFetchWithOptionalEmbeddedApiBearer attaches Authorization for protected API paths', async () => {
    const inner = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const fetch = wrapFetchWithOptionalEmbeddedApiBearer(inner, baseUrl, () => 'session-token');
    await fetch(`${baseUrl}${EMBEDDED_API_PATHS.guests}`);
    const [, init] = inner.mock.calls[0] as [RequestInfo, RequestInit | undefined];
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer session-token');
  });

  it('does not attach Authorization to login URL', async () => {
    const inner = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          token: 't',
          user: { id: 1, username: 'admin', role: 'Admin' },
          moduleKeys: [...HOTEL_MODULE_KEYS],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
    const fetch = wrapFetchWithOptionalEmbeddedApiBearer(inner, baseUrl, () => 'should-not-attach');
    await fetch(`${baseUrl}${EMBEDDED_API_PATHS.authLogin}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'changeme' }),
    });
    const [, init] = inner.mock.calls[0] as [RequestInfo, RequestInit | undefined];
    expect(new Headers(init?.headers).get('Authorization')).toBeNull();
  });

  it('does not attach Authorization to health URL when token is set', async () => {
    const inner = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    const fetch = wrapFetchWithOptionalEmbeddedApiBearer(inner, baseUrl, () => 'tok');
    await fetch(`${baseUrl}${EMBEDDED_API_PATHS.health}`);
    const [, init] = inner.mock.calls[0] as [string, RequestInit | undefined];
    expect(new Headers(init?.headers).get('Authorization')).toBeNull();
  });

  it('headersForEmbeddedApiFetchMerge keeps Content-Type when openapi-fetch calls fetch(Request) without init', async () => {
    const inner = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          token: 't',
          user: { id: 1, username: 'admin', role: 'Admin' },
          moduleKeys: [...HOTEL_MODULE_KEYS],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
    const fetch = wrapFetchWithOptionalEmbeddedApiBearer(inner, baseUrl, () => null);
    const req = new Request(`${baseUrl}${EMBEDDED_API_PATHS.authLogin}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'changeme' }),
    });
    await fetch(req);
    expect(inner).toHaveBeenCalled();
    const [, arg2] = inner.mock.calls[0] as [Request, RequestInit | undefined];
    expect(arg2?.headers).toBeDefined();
    const merged = new Headers(arg2?.headers);
    expect(merged.get('Content-Type')).toContain('application/json');
  });

  it('headersForEmbeddedApiFetchMerge prefers init.headers when provided', () => {
    const h = headersForEmbeddedApiFetchMerge('http://x', { headers: { 'X-Test': '1' } });
    expect(h.get('X-Test')).toBe('1');
  });
});
