import { useCallback, useEffect, useState } from 'react';

export type EmbeddedListState<T> =
  | { kind: 'loading' }
  | { kind: 'ok'; rows: T[] }
  | { kind: 'err'; message: string };

/**
 * Shared load/error state for list screens that read from the embedded API (StarHotelApp clients).
 */
export function useEmbeddedListLoad<T>(deps: {
  load: () => Promise<T[]>;
  formatError: (err: unknown) => string;
}): { list: EmbeddedListState<T>; reload: () => Promise<void> } {
  const { load, formatError } = deps;
  const [list, setList] = useState<EmbeddedListState<T>>({ kind: 'loading' });

  const reload = useCallback(async () => {
    setList({ kind: 'loading' });
    try {
      const rows = await load();
      setList({ kind: 'ok', rows });
    } catch (err) {
      setList({ kind: 'err', message: formatError(err) });
    }
  }, [load, formatError]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { list, reload };
}
