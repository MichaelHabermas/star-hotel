import type { GuestResponse } from '@shared/schemas/guest'
import { GuestNotFoundError } from './guest-errors'
import type { GuestRepository } from './guest-repository'
import type { GuestRow } from './guest-repository'

function rowToResponse(row: GuestRow): GuestResponse {
  return {
    id: row.GuestID,
    name: row.Name,
    idNumber: row.ID_Number,
    contact: row.Contact,
  }
}

export class GuestService {
  constructor(private readonly repo: GuestRepository) {}

  list(): GuestResponse[] {
    return this.repo.list().map(rowToResponse)
  }

  get(guestId: number): GuestResponse {
    const row = this.repo.getById(guestId)
    if (row === undefined) {
      throw new GuestNotFoundError(guestId)
    }
    return rowToResponse(row)
  }
}
