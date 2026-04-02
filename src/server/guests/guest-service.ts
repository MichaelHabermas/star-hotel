import type { GuestCreateBody, GuestResponse, GuestUpdateBody } from '@shared/schemas/guest';
import { emptyOrUndefinedToNull } from '../../domain/optional-string';
import { GuestInUseError, GuestNotFoundError } from './guest-errors';
import type { GuestRepository, GuestRow } from './guest-repository';

function rowToResponse(row: GuestRow): GuestResponse {
  return {
    id: row.GuestID,
    name: row.Name,
    idNumber: row.ID_Number,
    contact: row.Contact,
  };
}

export class GuestService {
  constructor(private readonly repo: GuestRepository) {}

  list(): GuestResponse[] {
    return this.repo.list().map(rowToResponse);
  }

  get(guestId: number): GuestResponse {
    const row = this.repo.getById(guestId);
    if (row === undefined) {
      throw new GuestNotFoundError(guestId);
    }
    return rowToResponse(row);
  }

  create(body: GuestCreateBody): GuestResponse {
    const id = this.repo.insert({
      Name: body.name,
      ID_Number: emptyOrUndefinedToNull(body.idNumber),
      Contact: emptyOrUndefinedToNull(body.contact),
    });
    return this.get(id);
  }

  update(guestId: number, body: GuestUpdateBody): GuestResponse {
    const existing = this.repo.getById(guestId);
    if (existing === undefined) {
      throw new GuestNotFoundError(guestId);
    }
    const row: GuestRow = {
      GuestID: existing.GuestID,
      Name: body.name ?? existing.Name,
      ID_Number: body.idNumber !== undefined ? body.idNumber : existing.ID_Number,
      Contact: body.contact !== undefined ? body.contact : existing.Contact,
    };
    this.repo.update(guestId, {
      Name: row.Name,
      ID_Number: row.ID_Number,
      Contact: row.Contact,
    });
    return this.get(guestId);
  }

  delete(guestId: number): void {
    const existing = this.repo.getById(guestId);
    if (existing === undefined) {
      throw new GuestNotFoundError(guestId);
    }
    if (this.repo.countReservationsForGuest(guestId) > 0) {
      throw new GuestInUseError(guestId);
    }
    const ok = this.repo.delete(guestId);
    if (!ok) {
      throw new GuestNotFoundError(guestId);
    }
  }
}
