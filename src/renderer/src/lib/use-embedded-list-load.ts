import { useCallback, useEffect, useRef, useState } from 'react';

export type EmbeddedListState<T> =
  | { kind: 'loading' }
  | { kind: 'ok'; rows: T[] }
  | { kind: 'err'; message: string };

/**
 * Shared load/error state for list screens that read from the embedded API (StarHotelApp clients).
 *
 * `load` / `formatError` are read from refs so inline lambdas (e.g. `load: () => app.api.rooms.list({})`)
 * do not change `reload` every render — that would retrigger the mount effect and flood the API.
 */
export function useEmbeddedListLoad<T>(deps: {
  load: () => Promise<T[]>;
  formatError: (err: unknown) => string;
}): { list: EmbeddedListState<T>; reload: () => Promise<void> } {
  const loadRef = useRef(deps.load);
  const formatErrorRef = useRef(deps.formatError);
  loadRef.current = deps.load;
  formatErrorRef.current = deps.formatError;

  const [list, setList] = useState<EmbeddedListState<T>>({ kind: 'loading' });

  const reload = useCallback(async () => {
    setList({ kind: 'loading' });
    try {
      const rows = await loadRef.current();
      setList({ kind: 'ok', rows });
    } catch (err) {
      setList({ kind: 'err', message: formatErrorRef.current(err) });
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { list, reload };
}
