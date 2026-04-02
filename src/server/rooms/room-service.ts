import type { RoomListQuery, RoomResponse } from '@shared/schemas/room'
import { RoomNotFoundError } from './room-errors'
import type { RoomRepository } from './room-repository'
import type { RoomRow } from './room-repository'

function rowToResponse(row: RoomRow): RoomResponse {
  return {
    id: row.RoomID,
    roomType: row.RoomType,
    price: row.Price,
    status: row.Status,
  }
}

export class RoomService {
  constructor(private readonly repo: RoomRepository) {}

  list(query: RoomListQuery): RoomResponse[] {
    return this.repo.list(query).map(rowToResponse)
  }

  get(roomId: number): RoomResponse {
    const row = this.repo.getById(roomId)
    if (row === undefined) {
      throw new RoomNotFoundError(roomId)
    }
    return rowToResponse(row)
  }
}
