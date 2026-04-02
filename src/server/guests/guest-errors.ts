export class GuestNotFoundError extends Error {
  readonly httpStatus = 404 as const;
  readonly errorCode = 'GUEST_NOT_FOUND' as const;

  constructor(readonly guestId: number) {
    super(`Guest ${guestId} not found`);
    this.name = 'GuestNotFoundError';
  }
}

export class GuestInUseError extends Error {
  readonly httpStatus = 409 as const;
  readonly errorCode = 'GUEST_IN_USE' as const;

  constructor(readonly guestId: number) {
    super(`Guest ${guestId} has reservations; remove or reassign them before deleting the guest`);
    this.name = 'GuestInUseError';
  }
}
