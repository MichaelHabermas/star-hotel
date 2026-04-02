import type { StarHotelApp } from '@renderer/lib/star-hotel-app';
import { useEmbeddedListLoad, type EmbeddedListState } from '@renderer/lib/use-embedded-list-load';
import type { RoomResponse } from '@shared/schemas/room';
import { useCallback } from 'react';

export type RoomsListState = EmbeddedListState<RoomResponse>;

export function useRoomsList(app: StarHotelApp): {
  list: RoomsListState;
  reload: () => Promise<void>;
} {
  const load = useCallback(() => app.api.rooms.list({}), [app]);
  const formatError = useCallback((err: unknown) => app.formatEmbeddedApiUserMessage(err), [app]);
  return useEmbeddedListLoad<RoomResponse>({ load, formatError });
}
