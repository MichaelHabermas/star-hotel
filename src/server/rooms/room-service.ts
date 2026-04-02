import type {
  RoomCreateBody,
  RoomListQuery,
  RoomResponse,
  RoomUpdateBody,
} from '@shared/schemas/room'
import { RoomInUseError, RoomNotFoundError } from './room-errors'
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

  create(body: RoomCreateBody): RoomResponse {
    const id = this.repo.insert({
      RoomType: body.roomType,
      Price: body.price,
      Status: body.status,
    })
    return this.get(id)
  }

  update(roomId: number, body: RoomUpdateBody): RoomResponse {
    const existing = this.repo.getById(roomId)
    if (existing === undefined) {
      throw new RoomNotFoundError(roomId)
    }
    const row: RoomRow = {
      RoomID: existing.RoomID,
      RoomType: body.roomType ?? existing.RoomType,
      Price: body.price ?? existing.Price,
      Status: body.status ?? existing.Status,
    }
    this.repo.update(roomId, {
      RoomType: row.RoomType,
      Price: row.Price,
      Status: row.Status,
    })
    return this.get(roomId)
  }

  delete(roomId: number): void {
    const existing = this.repo.getById(roomId)
    if (existing === undefined) {
      throw new RoomNotFoundError(roomId)
    }
    if (this.repo.countReservationsForRoom(roomId) > 0) {
      throw new RoomInUseError(roomId)
    }
    const ok = this.repo.delete(roomId)
    if (!ok) {
      throw new RoomNotFoundError(roomId)
    }
  }
}
