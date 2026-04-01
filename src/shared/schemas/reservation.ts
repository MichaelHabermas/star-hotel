import { z } from 'zod'

/** ISO 8601 calendar date (YYYY-MM-DD). */
export const isoDateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')

const positiveInt = z.coerce.number().int().positive()

export const reservationCreateBodySchema = z
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
  })

export type ReservationCreateBody = z.infer<typeof reservationCreateBodySchema>

export const reservationUpdateBodySchema = z
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
  )

export type ReservationUpdateBody = z.infer<typeof reservationUpdateBodySchema>

export const reservationIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const reservationListQuerySchema = z
  .object({
    roomId: z.coerce.number().int().positive().optional(),
    guestId: z.coerce.number().int().positive().optional(),
  })
  .strict()

export type ReservationListQuery = z.infer<typeof reservationListQuerySchema>

export const reservationResponseSchema = z.object({
  id: z.number(),
  roomId: z.number(),
  guestId: z.number(),
  checkInDate: isoDateStringSchema,
  checkOutDate: isoDateStringSchema,
  totalAmount: z.number(),
})

export type ReservationResponse = z.infer<typeof reservationResponseSchema>
