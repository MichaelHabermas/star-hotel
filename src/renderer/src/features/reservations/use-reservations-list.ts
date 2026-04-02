import type { StarHotelApp } from '@renderer/lib/star-hotel-app';
import { useEmbeddedListLoad, type EmbeddedListState } from '@renderer/lib/use-embedded-list-load';
import type { ReservationResponse } from '@shared/schemas/reservation';
import { useCallback } from 'react';

export type ReservationsListState = EmbeddedListState<ReservationResponse>;

export function useReservationsList(app: StarHotelApp): {
  readonly list: ReservationsListState;
  readonly reload: () => Promise<void>;
} {
  const load = useCallback(() => app.api.reservations.list({}), [app]);
  const formatError = useCallback((err: unknown) => app.formatEmbeddedApiUserMessage(err), [app]);
  return useEmbeddedListLoad<ReservationResponse>({ load, formatError });
}
