export class RoomNotFoundError extends Error {
  readonly httpStatus = 404 as const
  readonly errorCode = 'ROOM_NOT_FOUND' as const

  constructor(readonly roomId: number) {
    super(`Room ${roomId} not found`)
    this.name = 'RoomNotFoundError'
  }
}
