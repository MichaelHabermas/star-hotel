export class ReservationNotFoundError extends Error {
  readonly code = 'NOT_FOUND' as const
  constructor(readonly resId: number) {
    super(`Reservation ${resId} not found`)
    this.name = 'ReservationNotFoundError'
  }
}

export class RoomNotFoundError extends Error {
  readonly code = 'ROOM_NOT_FOUND' as const
  constructor(readonly roomId: number) {
    super(`Room ${roomId} not found`)
    this.name = 'RoomNotFoundError'
  }
}

export class GuestNotFoundError extends Error {
  readonly code = 'GUEST_NOT_FOUND' as const
  constructor(readonly guestId: number) {
    super(`Guest ${guestId} not found`)
    this.name = 'GuestNotFoundError'
  }
}

export class ReservationConflictError extends Error {
  readonly code = 'RESERVATION_OVERLAP' as const
  constructor(message = 'Room already has a reservation for overlapping dates') {
    super(message)
    this.name = 'ReservationConflictError'
  }
}
