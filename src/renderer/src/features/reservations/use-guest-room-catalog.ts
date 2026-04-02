import type { StarHotelApp } from '@renderer/lib/star-hotel-app';
import type { GuestResponse } from '@shared/schemas/guest';
import type { RoomResponse } from '@shared/schemas/room';
import { useCallback, useEffect, useRef, useState } from 'react';

export type GuestRoomCatalogState = {
  readonly guests: GuestResponse[];
  readonly rooms: RoomResponse[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly reload: () => Promise<void>;
};

/** Loads guest + room lists for reservation pickers (shared by list and form screens). */
export function useGuestRoomCatalog(app: StarHotelApp): GuestRoomCatalogState {
  const [guests, setGuests] = useState<GuestResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Request epoch (replaces a `cancelled` boolean): each `reload()` captures `generation` after
   * `++loadGenerationRef`. Effect cleanup bumps the ref on unmount (and when `[reload]` changes),
   * so any in-flight completion sees `generation !== loadGenerationRef.current` and skips
   * `setState` — no updates after unmount. Starting a new `reload()` also bumps the ref, so Retry
   * supersedes an older in-flight request the same way.
   */
  const loadGenerationRef = useRef(0);

  const reload = useCallback(async () => {
    const generation = ++loadGenerationRef.current;
    setLoading(true);
    setError(null);
    try {
      const [g, r] = await Promise.all([app.api.guests.list({}), app.api.rooms.list({})]);
      if (generation !== loadGenerationRef.current) return;
      setGuests(g);
      setRooms(r);
    } catch (err) {
      if (generation !== loadGenerationRef.current) return;
      setError(app.formatEmbeddedApiUserMessage(err));
    } finally {
      if (generation === loadGenerationRef.current) {
        setLoading(false);
      }
    }
  }, [app]);

  useEffect(() => {
    void reload();
    return () => {
      loadGenerationRef.current += 1;
    };
  }, [reload]);

  return { guests, rooms, loading, error, reload };
}
