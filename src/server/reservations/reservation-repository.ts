import type { ReservationListQuery } from '@shared/schemas/reservation';
import type DatabaseType from 'better-sqlite3';
import { ReservationConflictError } from './reservation-errors';
import type { ReservationRepositoryPort } from './reservation-repository-port';

type SqliteDatabase = InstanceType<typeof DatabaseType>;

export type ReservationRow = {
  ResID: number;
  RoomID: number;
  GuestID: number;
  CheckInDate: string;
  CheckOutDate: string;
  TotalAmount: number;
};

export type ReservationWrite = {
  roomId: number;
  guestId: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
};

export class ReservationRepository implements ReservationRepositoryPort {
  constructor(private readonly db: SqliteDatabase) {}

  list(query: ReservationListQuery): ReservationRow[] {
    const roomId = query.roomId;
    const guestId = query.guestId;
    if (roomId !== undefined && guestId !== undefined) {
      return this.db
        .prepare(
          `SELECT ResID, RoomID, GuestID, CheckInDate, CheckOutDate, TotalAmount
           FROM tbl_reservation
           WHERE RoomID = ? AND GuestID = ?
           ORDER BY CheckInDate DESC`,
        )
        .all(roomId, guestId) as ReservationRow[];
    }
    if (roomId !== undefined) {
      return this.db
        .prepare(
          `SELECT ResID, RoomID, GuestID, CheckInDate, CheckOutDate, TotalAmount
           FROM tbl_reservation
           WHERE RoomID = ?
           ORDER BY CheckInDate DESC`,
        )
        .all(roomId) as ReservationRow[];
    }
    if (guestId !== undefined) {
      return this.db
        .prepare(
          `SELECT ResID, RoomID, GuestID, CheckInDate, CheckOutDate, TotalAmount
           FROM tbl_reservation
           WHERE GuestID = ?
           ORDER BY CheckInDate DESC`,
        )
        .all(guestId) as ReservationRow[];
    }
    return this.db
      .prepare(
        `SELECT ResID, RoomID, GuestID, CheckInDate, CheckOutDate, TotalAmount
         FROM tbl_reservation
         ORDER BY CheckInDate DESC`,
      )
      .all() as ReservationRow[];
  }

  getById(resId: number): ReservationRow | undefined {
    return this.db
      .prepare(
        `SELECT ResID, RoomID, GuestID, CheckInDate, CheckOutDate, TotalAmount
         FROM tbl_reservation WHERE ResID = ?`,
      )
      .get(resId) as ReservationRow | undefined;
  }

  getRoomPrice(roomId: number): number | undefined {
    const row = this.db.prepare('SELECT Price FROM tbl_room WHERE RoomID = ?').get(roomId) as
      | { Price: number }
      | undefined;
    return row?.Price;
  }

  guestExists(guestId: number): boolean {
    const row = this.db.prepare('SELECT 1 AS ok FROM tbl_guest WHERE GuestID = ?').get(guestId) as
      | { ok: number }
      | undefined;
    return row !== undefined;
  }

  /**
   * Half-open stay overlap: [checkIn, checkOut) vs existing rows (ISO dates).
   * Same predicate as `stayRangesOverlapHalfOpen` in `reservation-stay-overlap.ts`.
   */
  findOverlappingReservation(
    roomId: number,
    checkIn: string,
    checkOut: string,
    excludeResId?: number,
  ): number | undefined {
    if (excludeResId !== undefined) {
      const row = this.db
        .prepare(
          `SELECT ResID FROM tbl_reservation
           WHERE RoomID = ?
             AND CheckInDate < ?
             AND CheckOutDate > ?
             AND ResID != ?
           LIMIT 1`,
        )
        .get(roomId, checkOut, checkIn, excludeResId) as { ResID: number } | undefined;
      return row?.ResID;
    }
    const row = this.db
      .prepare(
        `SELECT ResID FROM tbl_reservation
         WHERE RoomID = ?
           AND CheckInDate < ?
           AND CheckOutDate > ?
         LIMIT 1`,
      )
      .get(roomId, checkOut, checkIn) as { ResID: number } | undefined;
    return row?.ResID;
  }

  insert(row: ReservationWrite): number {
    const result = this.db
      .prepare(
        `INSERT INTO tbl_reservation (RoomID, GuestID, CheckInDate, CheckOutDate, TotalAmount)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(row.roomId, row.guestId, row.checkInDate, row.checkOutDate, row.totalAmount);
    return Number(result.lastInsertRowid);
  }

  update(resId: number, row: ReservationWrite): void {
    this.db
      .prepare(
        `UPDATE tbl_reservation
         SET RoomID = ?, GuestID = ?, CheckInDate = ?, CheckOutDate = ?, TotalAmount = ?
         WHERE ResID = ?`,
      )
      .run(row.roomId, row.guestId, row.checkInDate, row.checkOutDate, row.totalAmount, resId);
  }

  delete(resId: number): boolean {
    const result = this.db.prepare('DELETE FROM tbl_reservation WHERE ResID = ?').run(resId);
    return result.changes > 0;
  }

  insertWithNoOverlap(
    roomId: number,
    checkIn: string,
    checkOut: string,
    row: ReservationWrite,
  ): number {
    const run = this.db.transaction(() => {
      if (this.findOverlappingReservation(roomId, checkIn, checkOut) !== undefined) {
        throw new ReservationConflictError();
      }
      return this.insert(row);
    });
    return run();
  }

  updateWithNoOverlap(
    resId: number,
    roomId: number,
    checkIn: string,
    checkOut: string,
    row: ReservationWrite,
  ): void {
    const run = this.db.transaction(() => {
      if (this.findOverlappingReservation(roomId, checkIn, checkOut, resId) !== undefined) {
        throw new ReservationConflictError();
      }
      this.update(resId, row);
    });
    run();
  }
}
