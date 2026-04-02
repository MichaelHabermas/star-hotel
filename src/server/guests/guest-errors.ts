export class GuestNotFoundError extends Error {
  readonly httpStatus = 404 as const
  readonly errorCode = 'GUEST_NOT_FOUND' as const

  constructor(readonly guestId: number) {
    super(`Guest ${guestId} not found`)
    this.name = 'GuestNotFoundError'
  }
}
