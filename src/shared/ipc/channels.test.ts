import { describe, expect, it } from 'vitest';
import { IPC_CHANNELS } from './channels';

describe('IPC_CHANNELS', () => {
  it('uses stable ping channel name', () => {
    expect(IPC_CHANNELS.ping).toBe('star-hotel:ipc:ping');
  });
});
