import type { StarHotelApp } from '@renderer/lib/star-hotel-app';
import type { RoomResponse } from '@shared/schemas/room';
import { useCallback, useEffect, useState } from 'react';

export type RoomsListState =
  | { kind: 'loading' }
  | { kind: 'err'; message: string }
  | { kind: 'ok'; rows: RoomResponse[] };

export function useRoomsList(app: StarHotelApp): {
  list: RoomsListState;
  reload: () => Promise<void>;
} {
  const [list, setList] = useState<RoomsListState>({ kind: 'loading' });

  const reload = useCallback(async () => {
    setList({ kind: 'loading' });
    try {
      const rows = await app.api.rooms.list({});
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
