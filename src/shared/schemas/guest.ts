import { z } from 'zod';

export const guestIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** Reject unknown query keys on list endpoint. */
export const guestListQuerySchema = z.object({}).strict();

export type GuestListQuery = z.infer<typeof guestListQuerySchema>;

export const guestResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  idNumber: z.string().nullable(),
  contact: z.string().nullable(),
});

export type GuestResponse = z.infer<typeof guestResponseSchema>;

export const guestCreateBodySchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    idNumber: z.string().nullable().optional(),
    contact: z.string().nullable().optional(),
  })
  .strict();

export type GuestCreateBody = z.infer<typeof guestCreateBodySchema>;

export const guestUpdateBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    idNumber: z.string().nullable().optional(),
    contact: z.string().nullable().optional(),
  })
  .strict();

export type GuestUpdateBody = z.infer<typeof guestUpdateBodySchema>;
