import type { z } from 'zod';
import { z as zod } from './zod-openapi';

/** ISO 8601 calendar date (YYYY-MM-DD). */
export const isoDateStringSchema = zod.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

const positiveInt = zod.coerce.number().int().positive();

export const reservationCreateBodySchema = zod
  .object({
    roomId: positiveInt,
    guestId: positiveInt,
    checkInDate: isoDateStringSchema,
    checkOutDate: isoDateStringSchema,
  })
  .strict()
  .refine((x) => x.checkOutDate >= x.checkInDate, {
    message: 'checkOutDate must be on or after checkInDate',
    path: ['checkOutDate'],
  });

export type ReservationCreateBody = z.infer<typeof reservationCreateBodySchema>;

export const reservationUpdateBodySchema = zod
  .object({
    roomId: positiveInt.optional(),
    guestId: positiveInt.optional(),
    checkInDate: isoDateStringSchema.optional(),
    checkOutDate: isoDateStringSchema.optional(),
  })
  .strict()
  .refine(
    (x) =>
      x.checkInDate === undefined ||
      x.checkOutDate === undefined ||
      x.checkOutDate >= x.checkInDate,
    {
      message: 'checkOutDate must be on or after checkInDate',
      path: ['checkOutDate'],
    },
  );

export type ReservationUpdateBody = z.infer<typeof reservationUpdateBodySchema>;

export const reservationIdParamsSchema = zod.object({
  id: zod.coerce.number().int().positive(),
});

export const reservationListQuerySchema = zod
  .object({
    roomId: zod.coerce.number().int().positive().optional(),
    guestId: zod.coerce.number().int().positive().optional(),
  })
  .strict();

export type ReservationListQuery = z.infer<typeof reservationListQuerySchema>;

export const reservationResponseSchema = zod.object({
  id: zod.number(),
  roomId: zod.number(),
  guestId: zod.number(),
  checkInDate: isoDateStringSchema,
  checkOutDate: isoDateStringSchema,
  totalAmount: zod.number(),
});

export type ReservationResponse = z.infer<typeof reservationResponseSchema>;
