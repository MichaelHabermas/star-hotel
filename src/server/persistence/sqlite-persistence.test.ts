import { describe, expect, it } from 'vitest'
import { createSqlitePersistencePort } from './sqlite-persistence'

describe('createSqlitePersistencePort', () => {
  it('close is idempotent and safe before isReady', async () => {
    const p = createSqlitePersistencePort({ dbFilePath: ':memory:' })
    await expect(p.close()).resolves.toBeUndefined()
    await expect(p.close()).resolves.toBeUndefined()
  })

  it('closes database after isReady', async () => {
    const p = createSqlitePersistencePort({ dbFilePath: ':memory:' })
    await p.isReady()
    await expect(p.close()).resolves.toBeUndefined()
    await expect(p.close()).resolves.toBeUndefined()
  })
})
