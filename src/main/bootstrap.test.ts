import type http from 'node:http';
import { describe, expect, it, vi } from 'vitest';
import { startStarHotelMain } from './bootstrap';

describe('startStarHotelMain', () => {
  it('runs embedded API + IPC, then first window', async () => {
    const order: string[] = [];

    const registerWindowAllClosed = vi.fn(() => {
      order.push('windowAllClosed');
    });

    const whenReady = vi.fn(() => Promise.resolve());

    const app = {
      whenReady: whenReady,
      quit: vi.fn(),
    };

    const ensureEmbeddedApiAndIpc = vi.fn(async () => {
      order.push('apiAndIpc');
      return {} as http.Server;
    });

    const createMainWindow = vi.fn(() => {
      order.push('window');
    });

    const registerActivateHandler = vi.fn(() => {
      order.push('activate');
    });

    await startStarHotelMain({
      app,
      appStartMs: Date.now(),
      apiBaseUrl: 'http://127.0.0.1:45123',
      ensureEmbeddedApiAndIpc,
      registerWindowAllClosed,
      registerActivateHandler,
      createMainWindow,
      mainWindowParams: () => ({
        scriptDir: '/test',
        isDev: false,
        apiBaseUrl: 'http://127.0.0.1:45123',
      }),
      logger: { info: vi.fn(), error: vi.fn() },
    });

    expect(order).toEqual(['windowAllClosed', 'apiAndIpc', 'window', 'activate']);
    expect(whenReady).toHaveBeenCalledTimes(1);
    expect(ensureEmbeddedApiAndIpc).toHaveBeenCalledTimes(1);
  });

  it('quits and skips window when embedded API fails', async () => {
    const createMainWindow = vi.fn();
    const quit = vi.fn();

    await startStarHotelMain({
      app: {
        whenReady: () => Promise.resolve(),
        quit,
      },
      appStartMs: Date.now(),
      apiBaseUrl: 'http://127.0.0.1:45123',
      ensureEmbeddedApiAndIpc: vi.fn(async () => {
        throw new Error('bind failed');
      }),
      registerWindowAllClosed: vi.fn(),
      registerActivateHandler: vi.fn(),
      createMainWindow,
      mainWindowParams: () => ({
        scriptDir: '/test',
        isDev: false,
        apiBaseUrl: 'http://127.0.0.1:45123',
      }),
      logger: { info: vi.fn(), error: vi.fn() },
    });

    expect(quit).toHaveBeenCalledTimes(1);
    expect(createMainWindow).not.toHaveBeenCalled();
  });
});
