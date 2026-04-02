export class ReservationNotFoundError extends Error {
  readonly httpStatus = 404 as const;
  readonly errorCode = 'NOT_FOUND' as const;

  constructor(readonly resId: number) {
    super(`Reservation ${resId} not found`);
    this.name = 'ReservationNotFoundError';
  }
}

export class ReservationConflictError extends Error {
  readonly httpStatus = 409 as const;
  readonly errorCode = 'RESERVATION_OVERLAP' as const;

  constructor(message = 'Room already has a reservation for overlapping dates') {
    super(message);
    this.name = 'ReservationConflictError';
  }
}
