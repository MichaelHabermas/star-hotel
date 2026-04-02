import type { z } from 'zod';
import { isoDateStringSchema } from './reservation';
import { z as zod } from './zod-openapi';

const positiveInt = zod.coerce.number().int().positive();

/** Query: single-stay guest folio / receipt (E9). */
export const folioReportQuerySchema = zod
  .object({
    reservationId: positiveInt,
  })
  .strict();

export type FolioReportQuery = z.infer<typeof folioReportQuerySchema>;

/** Query: operational day sheet — stays active on the given calendar date (half-open stay model). */
export const daySheetReportQuerySchema = zod
  .object({
    date: isoDateStringSchema,
  })
  .strict();

export type DaySheetReportQuery = z.infer<typeof daySheetReportQuerySchema>;

export const folioGuestSchema = zod.object({
  id: zod.number(),
  name: zod.string(),
  idNumber: zod.string().nullable(),
  contact: zod.string().nullable(),
});

export const folioRoomSchema = zod.object({
  id: zod.number(),
  roomType: zod.string(),
  price: zod.number(),
  status: zod.string(),
});

export const folioReservationDetailSchema = zod.object({
  id: zod.number(),
  roomId: zod.number(),
  guestId: zod.number(),
  checkInDate: isoDateStringSchema,
  checkOutDate: isoDateStringSchema,
  totalAmount: zod.number(),
  nights: zod.number().int().nonnegative(),
});

export const folioReportResponseSchema = zod.object({
  generatedAt: zod.string(),
  reservation: folioReservationDetailSchema,
  guest: folioGuestSchema,
  room: folioRoomSchema,
});

export type FolioReportResponse = z.infer<typeof folioReportResponseSchema>;

export const daySheetLineSchema = zod.object({
  reservationId: zod.number(),
  roomId: zod.number(),
  roomType: zod.string(),
  guestName: zod.string(),
  checkInDate: isoDateStringSchema,
  checkOutDate: isoDateStringSchema,
});

export const daySheetReportResponseSchema = zod.object({
  date: isoDateStringSchema,
  totalRooms: zod.number().int().nonnegative(),
  occupancyCount: zod.number().int().nonnegative(),
  occupancyRate: zod.number(),
  lines: zod.array(daySheetLineSchema),
});

export type DaySheetReportResponse = z.infer<typeof daySheetReportResponseSchema>;
