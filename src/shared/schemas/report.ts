import { z } from 'zod';
import { isoDateStringSchema } from './reservation';

const positiveInt = z.coerce.number().int().positive();

/** Query: single-stay guest folio / receipt (E9). */
export const folioReportQuerySchema = z
  .object({
    reservationId: positiveInt,
  })
  .strict();

export type FolioReportQuery = z.infer<typeof folioReportQuerySchema>;

/** Query: operational day sheet — stays active on the given calendar date (half-open stay model). */
export const daySheetReportQuerySchema = z
  .object({
    date: isoDateStringSchema,
  })
  .strict();

export type DaySheetReportQuery = z.infer<typeof daySheetReportQuerySchema>;

export const folioGuestSchema = z.object({
  id: z.number(),
  name: z.string(),
  idNumber: z.string().nullable(),
  contact: z.string().nullable(),
});

export const folioRoomSchema = z.object({
  id: z.number(),
  roomType: z.string(),
  price: z.number(),
  status: z.string(),
});

export const folioReservationDetailSchema = z.object({
  id: z.number(),
  roomId: z.number(),
  guestId: z.number(),
  checkInDate: isoDateStringSchema,
  checkOutDate: isoDateStringSchema,
  totalAmount: z.number(),
  nights: z.number().int().nonnegative(),
});

export const folioReportResponseSchema = z.object({
  generatedAt: z.string(),
  reservation: folioReservationDetailSchema,
  guest: folioGuestSchema,
  room: folioRoomSchema,
});

export type FolioReportResponse = z.infer<typeof folioReportResponseSchema>;

export const daySheetLineSchema = z.object({
  reservationId: z.number(),
  roomId: z.number(),
  roomType: z.string(),
  guestName: z.string(),
  checkInDate: isoDateStringSchema,
  checkOutDate: isoDateStringSchema,
});

export const daySheetReportResponseSchema = z.object({
  date: isoDateStringSchema,
  totalRooms: z.number().int().nonnegative(),
  occupancyCount: z.number().int().nonnegative(),
  occupancyRate: z.number(),
  lines: z.array(daySheetLineSchema),
});

export type DaySheetReportResponse = z.infer<typeof daySheetReportResponseSchema>;
