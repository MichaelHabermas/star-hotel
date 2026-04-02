import type { StarHotelApp } from '@renderer/lib/star-hotel-app';
import type { ReservationResponse } from '@shared/schemas/reservation';
import { useCallback, useEffect, useState } from 'react';

export type ReservationsListState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok'; rows: ReservationResponse[] }
  | { kind: 'err'; message: string };

export function useReservationsList(app: StarHotelApp): {
  readonly list: ReservationsListState;
  readonly reload: () => Promise<void>;
} {
  const [list, setList] = useState<ReservationsListState>({ kind: 'idle' });

  const reload = useCallback(async () => {
    setList({ kind: 'loading' });
    try {
      const rows = await app.api.reservations.list({});
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
