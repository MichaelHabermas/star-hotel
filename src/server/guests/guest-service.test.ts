import { describe, expect, it } from 'vitest'
import type { GuestRow } from './guest-repository'
import { GuestRepository } from './guest-repository'
import { GuestService } from './guest-service'
import { GuestNotFoundError } from './guest-errors'

describe('GuestService', () => {
  it('list maps rows to API shape', () => {
    const rows: GuestRow[] = [
      { GuestID: 1, Name: 'A', ID_Number: null, Contact: null },
    ]
    const repo = {
      list: () => rows,
      getById: () => undefined,
    } as unknown as GuestRepository
    const svc = new GuestService(repo)
    expect(svc.list()).toEqual([{ id: 1, name: 'A', idNumber: null, contact: null }])
  })

  it('get throws when missing', () => {
    const repo = {
      list: () => [],
      getById: () => undefined,
    } as unknown as GuestRepository
    const svc = new GuestService(repo)
    expect(() => svc.get(99)).toThrow(GuestNotFoundError)
  })
})
