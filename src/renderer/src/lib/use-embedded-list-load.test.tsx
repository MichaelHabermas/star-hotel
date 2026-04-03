import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useEmbeddedListLoad } from './use-embedded-list-load';

describe('useEmbeddedListLoad', () => {
  it('loads rows and exposes ok state', async () => {
    const load = vi.fn().mockResolvedValue([{ id: 1 }]);
    const formatError = vi.fn((e: unknown) => String(e));

    const { result } = renderHook(() => useEmbeddedListLoad<{ id: number }>({ load, formatError }));

    await waitFor(() => {
      expect(result.current.list).toEqual({ kind: 'ok', rows: [{ id: 1 }] });
    });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('sets err when load rejects', async () => {
    const load = vi.fn().mockRejectedValue(new Error('boom'));
    const formatError = (e: unknown) => (e instanceof Error ? e.message : String(e));

    const { result } = renderHook(() => useEmbeddedListLoad({ load, formatError }));

    await waitFor(() => {
      expect(result.current.list).toEqual({ kind: 'err', message: 'boom' });
    });
  });

  it('calls load once when load is a new function each render (inline lambdas)', async () => {
    const loadImpl = vi.fn().mockResolvedValue([{ id: 1 }]);
    const { result, rerender } = renderHook(() =>
      useEmbeddedListLoad<{ id: number }>({
        load: () => loadImpl(),
        formatError: (e) => String(e),
      }),
    );
    rerender();
    rerender();
    await waitFor(() => {
      expect(result.current.list).toEqual({ kind: 'ok', rows: [{ id: 1 }] });
    });
    expect(loadImpl).toHaveBeenCalledTimes(1);
  });
});
