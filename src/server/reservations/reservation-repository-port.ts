import type { ReservationListQuery } from '@shared/schemas/reservation'
import type { ReservationRow, ReservationWrite } from './reservation-repository'

/**
 * Data access surface used by {@link ReservationService}. Enables in-memory fakes for unit tests.
 */
export type ReservationRepositoryPort = {
  list(query: ReservationListQuery): ReservationRow[]
  getById(resId: number): ReservationRow | undefined
  getRoomPrice(roomId: number): number | undefined
  guestExists(guestId: number): boolean
  findOverlappingReservation(
    roomId: number,
    checkIn: string,
    checkOut: string,
    excludeResId?: number,
  ): number | undefined
  insert(row: ReservationWrite): number
  update(resId: number, row: ReservationWrite): void
  delete(resId: number): boolean
}
