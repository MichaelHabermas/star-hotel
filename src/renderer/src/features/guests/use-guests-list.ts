import type { StarHotelApp } from '@renderer/lib/star-hotel-app';
import type { GuestResponse } from '@shared/schemas/guest';
import { useCallback, useEffect, useState } from 'react';

export type GuestsListState =
  | { kind: 'loading' }
  | { kind: 'err'; message: string }
  | { kind: 'ok'; rows: GuestResponse[] };

export function useGuestsList(app: StarHotelApp): {
  list: GuestsListState;
  reload: () => Promise<void>;
} {
  const [list, setList] = useState<GuestsListState>({ kind: 'loading' });

  const reload = useCallback(async () => {
    setList({ kind: 'loading' });
    try {
      const rows = await app.api.guests.list({});
      setList({ kind: 'ok', rows });
    } catch (err) {
      setList({ kind: 'err', message: app.formatEmbeddedApiUserMessage(err) });
    }
  }, [app]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { list, reload };
}
