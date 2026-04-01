import { describe, expect, it, vi } from 'vitest'
import { IPC_CHANNELS } from './channels'
import { invokeIpcPing } from './typed-invoke'

describe('invokeIpcPing', () => {
  it('parses successful invoke result', async () => {
    const invoke = vi.fn(async (channel: string) => {
      expect(channel).toBe(IPC_CHANNELS.ping)
      return { ok: true as const }
    })
    await expect(invokeIpcPing({ invoke })).resolves.toEqual({ ok: true })
  })

  it('throws when response shape is wrong', async () => {
    const invoke = vi.fn(async () => ({ ok: false }))
    await expect(invokeIpcPing({ invoke })).rejects.toThrow()
  })
})
