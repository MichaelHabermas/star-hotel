import type http from 'node:http'
import { describe, expect, it, vi } from 'vitest'
import { startStarHotelMain } from './bootstrap'

describe('startStarHotelMain', () => {
  it('runs embedded API, then IPC registration, then first window', async () => {
    const order: string[] = []

    const registerWindowAllClosed = vi.fn(() => {
      order.push('windowAllClosed')
    })

    const whenReady = vi.fn(() => Promise.resolve())

    const app = {
      whenReady: whenReady,
      quit: vi.fn(),
    }

    const ensureEmbeddedApiServer = vi.fn(async () => {
      order.push('api')
      return {} as http.Server
    })

    const registerIpcHandlers = vi.fn(() => {
      order.push('ipc')
    })

    const createMainWindow = vi.fn(() => {
      order.push('window')
    })

    const registerActivateHandler = vi.fn(() => {
      order.push('activate')
    })

    await startStarHotelMain({
      app,
      appStartMs: Date.now(),
      apiBaseUrl: 'http://127.0.0.1:45123',
      ensureEmbeddedApiServer,
      registerIpcHandlers,
      registerWindowAllClosed,
      registerActivateHandler,
      createMainWindow,
      mainWindowParams: () => ({
        scriptDir: '/test',
        isDev: false,
        apiBaseUrl: 'http://127.0.0.1:45123',
      }),
      logger: { log: vi.fn(), error: vi.fn() },
    })

    expect(order).toEqual(['windowAllClosed', 'api', 'ipc', 'window', 'activate'])
    expect(whenReady).toHaveBeenCalledTimes(1)
  })

  it('quits and skips IPC when embedded API fails', async () => {
    const registerIpcHandlers = vi.fn()
    const createMainWindow = vi.fn()
    const quit = vi.fn()

    await startStarHotelMain({
      app: {
        whenReady: () => Promise.resolve(),
        quit,
      },
      appStartMs: Date.now(),
      apiBaseUrl: 'http://127.0.0.1:45123',
      ensureEmbeddedApiServer: vi.fn(async () => {
        throw new Error('bind failed')
      }),
      registerIpcHandlers,
      registerWindowAllClosed: vi.fn(),
      registerActivateHandler: vi.fn(),
      createMainWindow,
      mainWindowParams: () => ({
        scriptDir: '/test',
        isDev: false,
        apiBaseUrl: 'http://127.0.0.1:45123',
      }),
      logger: { log: vi.fn(), error: vi.fn() },
    })

    expect(quit).toHaveBeenCalledTimes(1)
    expect(registerIpcHandlers).not.toHaveBeenCalled()
    expect(createMainWindow).not.toHaveBeenCalled()
  })
})
