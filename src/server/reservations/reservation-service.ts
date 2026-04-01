import { computeReservationTotal, countStayNights } from '../../domain/reservation-pricing'
import type {
  ReservationCreateBody,
  ReservationListQuery,
  ReservationResponse,
  ReservationUpdateBody,
} from '@shared/schemas/reservation'
import { mapSqliteConstraintError } from '../db/db-errors'
import {
  GuestNotFoundError,
  ReservationNotFoundError,
  RoomNotFoundError,
} from './reservation-errors'
import type { ReservationRepositoryPort } from './reservation-repository-port'
import type { ReservationRow } from './reservation-repository'

function rowToResponse(row: ReservationRow): ReservationResponse {
  return {
    id: row.ResID,
    roomId: row.RoomID,
    guestId: row.GuestID,
    checkInDate: row.CheckInDate,
    checkOutDate: row.CheckOutDate,
    totalAmount: row.TotalAmount,
  }
}

export class ReservationService {
  constructor(private readonly repo: ReservationRepositoryPort) {}

  list(query: ReservationListQuery): ReservationResponse[] {
    return this.repo.list(query).map(rowToResponse)
  }

  get(resId: number): ReservationResponse {
    const row = this.repo.getById(resId)
    if (!row) {
      throw new ReservationNotFoundError(resId)
    }
    return rowToResponse(row)
  }

  private assertGuest(guestId: number): void {
    if (!this.repo.guestExists(guestId)) {
      throw new GuestNotFoundError(guestId)
    }
  }

  private assertRoomAndPrice(roomId: number): number {
    const price = this.repo.getRoomPrice(roomId)
    if (price === undefined) {
      throw new RoomNotFoundError(roomId)
    }
    return price
  }

  private computeTotal(roomId: number, checkIn: string, checkOut: string): number {
    const price = this.assertRoomAndPrice(roomId)
    const nights = countStayNights(checkIn, checkOut)
    return computeReservationTotal(nights, price)
  }

  create(body: ReservationCreateBody): ReservationResponse {
    this.assertGuest(body.guestId)
    const totalAmount = this.computeTotal(body.roomId, body.checkInDate, body.checkOutDate)
    try {
      const id = this.repo.insertWithNoOverlap(body.roomId, body.checkInDate, body.checkOutDate, {
        roomId: body.roomId,
        guestId: body.guestId,
        checkInDate: body.checkInDate,
        checkOutDate: body.checkOutDate,
        totalAmount,
      })
      return this.get(id)
    } catch (e) {
      throw mapSqliteConstraintError(e)
    }
  }

  update(resId: number, body: ReservationUpdateBody): ReservationResponse {
    const existing = this.repo.getById(resId)
    if (!existing) {
      throw new ReservationNotFoundError(resId)
    }

    const roomId = body.roomId ?? existing.RoomID
    const guestId = body.guestId ?? existing.GuestID
    const checkInDate = body.checkInDate ?? existing.CheckInDate
    const checkOutDate = body.checkOutDate ?? existing.CheckOutDate

    if (body.guestId !== undefined) {
      this.assertGuest(guestId)
    }

    const datesOrRoomChanged =
      body.roomId !== undefined || body.checkInDate !== undefined || body.checkOutDate !== undefined

    const totalAmount = datesOrRoomChanged
      ? this.computeTotal(roomId, checkInDate, checkOutDate)
      : existing.TotalAmount

    try {
      this.repo.updateWithNoOverlap(resId, roomId, checkInDate, checkOutDate, {
        roomId,
        guestId,
        checkInDate,
        checkOutDate,
        totalAmount,
      })
      return this.get(resId)
    } catch (e) {
      throw mapSqliteConstraintError(e)
    }
  }

  delete(resId: number): void {
    const deleted = this.repo.delete(resId)
    if (!deleted) {
      throw new ReservationNotFoundError(resId)
    }
  }
}
