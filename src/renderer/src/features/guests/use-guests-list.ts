import type { StarHotelApp } from '@renderer/lib/star-hotel-app';
import { useEmbeddedListLoad, type EmbeddedListState } from '@renderer/lib/use-embedded-list-load';
import type { GuestResponse } from '@shared/schemas/guest';
import { useCallback } from 'react';

export type GuestsListState = EmbeddedListState<GuestResponse>;

export function useGuestsList(app: StarHotelApp): {
  list: GuestsListState;
  reload: () => Promise<void>;
} {
  const load = useCallback(() => app.api.guests.list({}), [app]);
  const formatError = useCallback((err: unknown) => app.formatEmbeddedApiUserMessage(err), [app]);
  return useEmbeddedListLoad<GuestResponse>({ load, formatError });
}
