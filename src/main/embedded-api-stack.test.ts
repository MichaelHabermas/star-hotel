import type http from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createEmbeddedApiStack } from './embedded-api-stack'
import { registerIpcHandlers } from './ipc-handlers'

vi.mock('./ipc-handlers', () => ({
  registerIpcHandlers: vi.fn(),
}))

describe('createEmbeddedApiStack', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('ensureEmbeddedApiAndIpc calls injected persistence and server once; IPC receives persistence', async () => {
    const persistenceClose = vi.fn(async () => {})
    const fakePersistence = {
      isReady: async () => {},
      close: persistenceClose,
      getDatabase: () => {
        throw new Error('not used in this test')
      },
    }
    const createPersistence = vi.fn(() => fakePersistence)

    const fakeServer = {
      close: vi.fn((cb: (err?: Error) => void) => {
        cb()
      }),
    } as unknown as http.Server
    const startServer = vi.fn(async () => fakeServer)

    const stack = createEmbeddedApiStack({
      getUserDataPath: () => '/fake/user/Data',
      env: { STAR_HOTEL_PORT: '45123' },
      createSqlitePersistencePort: createPersistence,
      startEmbeddedApiServer: startServer,
    })

    await stack.ensureEmbeddedApiAndIpc()
    await stack.ensureEmbeddedApiAndIpc()

    expect(createPersistence).toHaveBeenCalledTimes(1)
    expect(createPersistence).toHaveBeenCalledWith({
      dbFilePath: expect.stringMatching(/database\.sqlite$/),
    })
    expect(startServer).toHaveBeenCalledTimes(1)

    expect(registerIpcHandlers).toHaveBeenCalledTimes(1)
    expect(registerIpcHandlers).toHaveBeenCalledWith({
      getPersistence: expect.any(Function),
    })
    const getPersistence = vi.mocked(registerIpcHandlers).mock.calls[0][0].getPersistence
    expect(getPersistence()).toBe(fakePersistence)
  })

  it('registerShutdownHandlers closes server then persistence before app.quit', async () => {
    const persistenceClose = vi.fn(async () => {})
    const fakePersistence = {
      isReady: async () => {},
      close: persistenceClose,
      getDatabase: () => {
        throw new Error('not used')
      },
    }
    const createPersistence = vi.fn(() => fakePersistence)

    const fakeServer = {
      close: vi.fn((cb: (err?: Error) => void) => {
        cb()
      }),
    } as unknown as http.Server
    const startServer = vi.fn(async () => fakeServer)

    const stack = createEmbeddedApiStack({
      getUserDataPath: () => '/fake/user/Data',
      env: { STAR_HOTEL_PORT: '45123' },
      createSqlitePersistencePort: createPersistence,
      startEmbeddedApiServer: startServer,
    })

    await stack.ensureEmbeddedApiAndIpc()

    let beforeQuit: ((e: { preventDefault: () => void }) => void) | undefined
    const mockApp = {
      on: vi.fn((event: string, fn: (e: { preventDefault: () => void }) => void) => {
        if (event === 'before-quit') {
          beforeQuit = fn
        }
      }),
      quit: vi.fn(),
    }

    stack.registerShutdownHandlers(mockApp as never)

    expect(beforeQuit).toBeDefined()
    const mockEvent = { preventDefault: vi.fn() }
    beforeQuit!(mockEvent)

    await vi.waitFor(() => {
      expect(mockApp.quit).toHaveBeenCalled()
    })

    expect(fakeServer.close).toHaveBeenCalled()
    expect(persistenceClose).toHaveBeenCalled()
  })
})
