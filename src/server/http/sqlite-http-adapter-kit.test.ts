import type { NextFunction, Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'
import { createSqlitePersistencePort } from '../persistence/sqlite-persistence'
import { createSqliteHttpAdapterKit } from './sqlite-http-adapter-kit'

describe('createSqliteHttpAdapterKit', () => {
  it('asyncHandler forwards rejections to next', async () => {
    const persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' })
    await persistence.isReady()
    const kit = createSqliteHttpAdapterKit(persistence)
    const next = vi.fn<(err?: unknown) => void>()
    const err = new Error('route failed')
    const handler = kit.asyncHandler(async () => {
      throw err
    })
    await new Promise<void>((resolve) => {
      handler({} as Request, {} as Response, ((e: unknown) => {
        next(e)
        resolve()
      }) as NextFunction)
    })
    expect(next).toHaveBeenCalledWith(err)
  })

  it('createLazySqliteService returns the same promise for concurrent callers', async () => {
    const persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' })
    const kit = createSqliteHttpAdapterKit(persistence)
    let factoryCalls = 0
    const getSvc = kit.createLazySqliteService((db) => {
      factoryCalls += 1
      return { id: db.prepare('SELECT 1 AS n').get() as { n: number } }
    })
    const [a, b] = await Promise.all([getSvc(), getSvc()])
    expect(a).toBe(b)
    expect(factoryCalls).toBe(1)
    await persistence.close()
  })

  it('createLazySqliteService memoizes after isReady resolves', async () => {
    const persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' })
    const kit = createSqliteHttpAdapterKit(persistence)
    let builds = 0
    const getSvc = kit.createLazySqliteService((db) => {
      builds += 1
      return { db }
    })
    await getSvc()
    await getSvc()
    expect(builds).toBe(1)
    await persistence.close()
  })

  it('ensurePersistenceReady calls next after isReady', async () => {
    const persistence = createSqlitePersistencePort({ dbFilePath: ':memory:' })
    const kit = createSqliteHttpAdapterKit(persistence)
    const next = vi.fn()
    await new Promise<void>((resolve, reject) => {
      const fn: NextFunction = (err?: unknown) => {
        if (err) {
          reject(err)
          return
        }
        next()
        resolve()
      }
      void kit.ensurePersistenceReady({} as Request, {} as Response, fn)
    })
    expect(next).toHaveBeenCalledTimes(1)
    await persistence.close()
  })
})
