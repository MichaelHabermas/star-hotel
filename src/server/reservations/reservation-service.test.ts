import type { ReservationListQuery } from '@shared/schemas/reservation';
import { describe, expect, it } from 'vitest';
import { GuestNotFoundError } from '../guests/guest-errors';
import { RoomNotFoundError } from '../rooms/room-errors';
import { ReservationConflictError, ReservationNotFoundError } from './reservation-errors';
import type { ReservationRow, ReservationWrite } from './reservation-repository';
import type { ReservationRepositoryPort } from './reservation-repository-port';
import { ReservationService } from './reservation-service';
import { stayRangesOverlapHalfOpen } from './reservation-stay-overlap';

/** Minimal in-memory repo for unit tests (mirrors overlap semantics of SQL layer). */
class InMemoryReservationRepository implements ReservationRepositoryPort {
  private nextId = 1;
  private readonly rows = new Map<number, ReservationRow>();
  private readonly roomPrices = new Map<number, number>();
  private readonly guestIds = new Set<number>();

  seedRoom(roomId: number, price: number): void {
    this.roomPrices.set(roomId, price);
  }

  seedGuest(guestId: number): void {
    this.guestIds.add(guestId);
  }

  list(query: ReservationListQuery): ReservationRow[] {
    const all = Array.from(this.rows.values()).sort((a, b) =>
      a.CheckInDate < b.CheckInDate ? 1 : -1,
    );
    if (query.roomId !== undefined && query.guestId !== undefined) {
      return all.filter((r) => r.RoomID === query.roomId && r.GuestID === query.guestId);
    }
    if (query.roomId !== undefined) {
      return all.filter((r) => r.RoomID === query.roomId);
    }
    if (query.guestId !== undefined) {
      return all.filter((r) => r.GuestID === query.guestId);
    }
    return all;
  }

  getById(resId: number): ReservationRow | undefined {
    return this.rows.get(resId);
  }

  getRoomPrice(roomId: number): number | undefined {
    return this.roomPrices.get(roomId);
  }

  guestExists(guestId: number): boolean {
    return this.guestIds.has(guestId);
  }

  findOverlappingReservation(
    roomId: number,
    checkIn: string,
    checkOut: string,
    excludeResId?: number,
  ): number | undefined {
    for (const row of Array.from(this.rows.values())) {
      if (row.RoomID !== roomId) {
        continue;
      }
      if (excludeResId !== undefined && row.ResID === excludeResId) {
        continue;
      }
      if (stayRangesOverlapHalfOpen(checkIn, checkOut, row.CheckInDate, row.CheckOutDate)) {
        return row.ResID;
      }
    }
    return undefined;
  }

  insert(row: ReservationWrite): number {
    const id = this.nextId++;
    this.rows.set(id, {
      ResID: id,
      RoomID: row.roomId,
      GuestID: row.guestId,
      CheckInDate: row.checkInDate,
      CheckOutDate: row.checkOutDate,
      TotalAmount: row.totalAmount,
    });
    return id;
  }

  update(resId: number, row: ReservationWrite): void {
    const existing = this.rows.get(resId);
    if (!existing) {
      return;
    }
    this.rows.set(resId, {
      ResID: resId,
      RoomID: row.roomId,
      GuestID: row.guestId,
      CheckInDate: row.checkInDate,
      CheckOutDate: row.checkOutDate,
      TotalAmount: row.totalAmount,
    });
  }

  delete(resId: number): boolean {
    return this.rows.delete(resId);
  }

  insertWithNoOverlap(
    roomId: number,
    checkIn: string,
    checkOut: string,
    row: ReservationWrite,
  ): number {
    if (this.findOverlappingReservation(roomId, checkIn, checkOut) !== undefined) {
      throw new ReservationConflictError();
    }
    return this.insert(row);
  }

  updateWithNoOverlap(
    resId: number,
    roomId: number,
    checkIn: string,
    checkOut: string,
    row: ReservationWrite,
  ): void {
    if (this.findOverlappingReservation(roomId, checkIn, checkOut, resId) !== undefined) {
      throw new ReservationConflictError();
    }
    this.update(resId, row);
  }
}

describe('ReservationService', () => {
  it('creates a reservation with computed total (3 nights × 100)', () => {
    const repo = new InMemoryReservationRepository();
    repo.seedRoom(1, 100);
    repo.seedGuest(10);
    const svc = new ReservationService(repo);

    const res = svc.create({
      roomId: 1,
      guestId: 10,
      checkInDate: '2026-06-01',
      checkOutDate: '2026-06-04',
    });

    expect(res).toMatchObject({
      roomId: 1,
      guestId: 10,
      checkInDate: '2026-06-01',
      checkOutDate: '2026-06-04',
      totalAmount: 300,
    });
    expect(res.id).toBeGreaterThan(0);
  });

  it('throws GuestNotFoundError when guest is missing', () => {
    const repo = new InMemoryReservationRepository();
    repo.seedRoom(1, 100);
    const svc = new ReservationService(repo);

    expect(() =>
      svc.create({
        roomId: 1,
        guestId: 99,
        checkInDate: '2026-06-01',
        checkOutDate: '2026-06-02',
      }),
    ).toThrow(GuestNotFoundError);
  });

  it('throws RoomNotFoundError when room is missing', () => {
    const repo = new InMemoryReservationRepository();
    repo.seedGuest(10);
    const svc = new ReservationService(repo);

    expect(() =>
      svc.create({
        roomId: 999,
        guestId: 10,
        checkInDate: '2026-06-01',
        checkOutDate: '2026-06-02',
      }),
    ).toThrow(RoomNotFoundError);
  });

  it('throws ReservationConflictError on overlapping stay for same room', () => {
    const repo = new InMemoryReservationRepository();
    repo.seedRoom(1, 100);
    repo.seedGuest(10);
    const svc = new ReservationService(repo);

    svc.create({
      roomId: 1,
      guestId: 10,
      checkInDate: '2026-06-01',
      checkOutDate: '2026-06-10',
    });

    expect(() =>
      svc.create({
        roomId: 1,
        guestId: 10,
        checkInDate: '2026-06-05',
        checkOutDate: '2026-06-06',
      }),
    ).toThrow(ReservationConflictError);
  });

  it('get throws ReservationNotFoundError for unknown id', () => {
    const repo = new InMemoryReservationRepository();
    const svc = new ReservationService(repo);

    expect(() => svc.get(404)).toThrow(ReservationNotFoundError);
  });

  it('delete throws ReservationNotFoundError when row missing', () => {
    const repo = new InMemoryReservationRepository();
    const svc = new ReservationService(repo);

    expect(() => svc.delete(1)).toThrow(ReservationNotFoundError);
  });
});
