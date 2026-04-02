import type DatabaseType from 'better-sqlite3';

type SqliteDatabase = InstanceType<typeof DatabaseType>;

export type FolioJoinRow = {
  ResID: number;
  RoomID: number;
  GuestID: number;
  CheckInDate: string;
  CheckOutDate: string;
  TotalAmount: number;
  GuestName: string;
  ID_Number: string | null;
  Contact: string | null;
  RoomType: string;
  RoomPrice: number;
  RoomStatus: string;
};

export type DaySheetJoinRow = {
  ResID: number;
  RoomID: number;
  GuestName: string;
  RoomType: string;
  CheckInDate: string;
  CheckOutDate: string;
};

export class ReportRepository {
  constructor(private readonly db: SqliteDatabase) {}

  getFolioRow(reservationId: number): FolioJoinRow | undefined {
    return this.db
      .prepare(
        `SELECT r.ResID, r.RoomID, r.GuestID, r.CheckInDate, r.CheckOutDate, r.TotalAmount,
                g.Name AS GuestName, g.ID_Number, g.Contact,
                rm.RoomType, rm.Price AS RoomPrice, rm.Status AS RoomStatus
         FROM tbl_reservation r
         INNER JOIN tbl_guest g ON g.GuestID = r.GuestID
         INNER JOIN tbl_room rm ON rm.RoomID = r.RoomID
         WHERE r.ResID = ?`,
      )
      .get(reservationId) as FolioJoinRow | undefined;
  }

  /**
   * Stays where `date` falls in [CheckInDate, CheckOutDate) (same half-open rule as overlap checks).
   */
  listDaySheetRows(date: string): DaySheetJoinRow[] {
    return this.db
      .prepare(
        `SELECT r.ResID, r.RoomID, g.Name AS GuestName, rm.RoomType,
                r.CheckInDate, r.CheckOutDate
         FROM tbl_reservation r
         INNER JOIN tbl_guest g ON g.GuestID = r.GuestID
         INNER JOIN tbl_room rm ON rm.RoomID = r.RoomID
         WHERE r.CheckInDate <= ? AND r.CheckOutDate > ?
         ORDER BY r.RoomID ASC, r.ResID ASC`,
      )
      .all(date, date) as DaySheetJoinRow[];
  }

  countRooms(): number {
    const row = this.db.prepare('SELECT COUNT(*) AS c FROM tbl_room').get() as { c: number };
    return row.c;
  }
}
