import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createEmbeddedApiAuthMiddleware } from './embedded-api-auth-middleware';
import { createInMemorySessionStore } from './session-store';

describe('createEmbeddedApiAuthMiddleware', () => {
  beforeEach(() => {
    vi.stubEnv('STAR_HOTEL_SKIP_AUTH', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows exempt paths without a session', () => {
    const store = createInMemorySessionStore();
    const mw = createEmbeddedApiAuthMiddleware({ sessionStore: store });
    const next = vi.fn();
    const req = { path: '/health', headers: {} } as Parameters<typeof mw>[0];
    mw(req, {} as Parameters<typeof mw>[1], next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('rejects protected paths without Bearer', () => {
    const store = createInMemorySessionStore();
    const mw = createEmbeddedApiAuthMiddleware({ sessionStore: store });
    const next = vi.fn();
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const req = { path: '/api/guests', headers: {} } as Parameters<typeof mw>[0];
    const res = { status } as unknown as Parameters<typeof mw>[1];
    mw(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      }),
    );
  });

  it('attaches user when token matches store', () => {
    const store = createInMemorySessionStore();
    const token = 'abc';
    store.putSession(token, { userId: 1, username: 'u', role: 'admin' });
    const mw = createEmbeddedApiAuthMiddleware({ sessionStore: store });
    const next = vi.fn();
    const req = {
      path: '/api/guests',
      headers: { authorization: `Bearer ${token}` },
    } as Parameters<typeof mw>[0];
    mw(req, {} as Parameters<typeof mw>[1], next);
    expect(next).toHaveBeenCalledOnce();
    expect(
      (req as { starHotelUser?: { id: number; username: string; role: string } }).starHotelUser,
    ).toEqual({ id: 1, username: 'u', role: 'admin' });
  });

  it('honors skipAuth without reading env', () => {
    const store = createInMemorySessionStore();
    const mw = createEmbeddedApiAuthMiddleware({ sessionStore: store, skipAuth: true });
    const next = vi.fn();
    const req = { path: '/api/guests', headers: {} } as Parameters<typeof mw>[0];
    mw(req, {} as Parameters<typeof mw>[1], next);
    expect(next).toHaveBeenCalledOnce();
  });
});
