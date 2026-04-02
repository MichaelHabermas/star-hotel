export class RoomNotFoundError extends Error {
  readonly httpStatus = 404 as const;
  readonly errorCode = 'ROOM_NOT_FOUND' as const;

  constructor(readonly roomId: number) {
    super(`Room ${roomId} not found`);
    this.name = 'RoomNotFoundError';
  }
}

export class RoomInUseError extends Error {
  readonly httpStatus = 409 as const;
  readonly errorCode = 'ROOM_IN_USE' as const;

  constructor(readonly roomId: number) {
    super(`Room ${roomId} has reservations; remove or reassign them before deleting the room`);
    this.name = 'RoomInUseError';
  }
}
