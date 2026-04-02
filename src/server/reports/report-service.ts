import type { DaySheetReportResponse, FolioReportResponse } from '@shared/schemas/report';
import { countStayNights } from '../../domain/reservation-pricing';
import { ReservationNotFoundError } from '../reservations/reservation-errors';
import type { FolioJoinRow } from './report-repository';
import { ReportRepository } from './report-repository';

function rowToFolio(row: FolioJoinRow, generatedAt: string): FolioReportResponse {
  const nights = countStayNights(row.CheckInDate, row.CheckOutDate);
  return {
    generatedAt,
    reservation: {
      id: row.ResID,
      roomId: row.RoomID,
      guestId: row.GuestID,
      checkInDate: row.CheckInDate,
      checkOutDate: row.CheckOutDate,
      totalAmount: row.TotalAmount,
      nights,
    },
    guest: {
      id: row.GuestID,
      name: row.GuestName,
      idNumber: row.ID_Number,
      contact: row.Contact,
    },
    room: {
      id: row.RoomID,
      roomType: row.RoomType,
      price: row.RoomPrice,
      status: row.RoomStatus,
    },
  };
}

export class ReportService {
  constructor(private readonly repo: ReportRepository) {}

  getFolio(reservationId: number): FolioReportResponse {
    const row = this.repo.getFolioRow(reservationId);
    if (!row) {
      throw new ReservationNotFoundError(reservationId);
    }
    return rowToFolio(row, new Date().toISOString());
  }

  getDaySheet(date: string): DaySheetReportResponse {
    const lines = this.repo.listDaySheetRows(date);
    const totalRooms = this.repo.countRooms();
    const occupancyCount = lines.length;
    const occupancyRate = totalRooms > 0 ? occupancyCount / totalRooms : 0;
    return {
      date,
      totalRooms,
      occupancyCount,
      occupancyRate,
      lines: lines.map((l) => ({
        reservationId: l.ResID,
        roomId: l.RoomID,
        roomType: l.RoomType,
        guestName: l.GuestName,
        checkInDate: l.CheckInDate,
        checkOutDate: l.CheckOutDate,
      })),
    };
  }
}
