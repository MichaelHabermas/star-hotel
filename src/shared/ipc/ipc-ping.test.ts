import { describe, expect, it } from 'vitest';
import { ipcPingResponseSchema } from './ipc-ping';

describe('ipcPingResponseSchema', () => {
  it('accepts main process ping payload', () => {
    expect(ipcPingResponseSchema.parse({ ok: true })).toEqual({ ok: true });
  });

  it('rejects invalid ok field', () => {
    expect(() => ipcPingResponseSchema.parse({ ok: false })).toThrow();
  });
});
