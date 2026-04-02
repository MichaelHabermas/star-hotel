import type { z } from 'zod';
import { z as zod } from './zod-openapi';

export const guestIdParamsSchema = zod.object({
  id: zod.coerce.number().int().positive(),
});

/** Reject unknown query keys on list endpoint. */
export const guestListQuerySchema = zod.object({}).strict();

export type GuestListQuery = z.infer<typeof guestListQuerySchema>;

export const guestResponseSchema = zod.object({
  id: zod.number(),
  name: zod.string(),
  idNumber: zod.string().nullable(),
  contact: zod.string().nullable(),
});

export type GuestResponse = z.infer<typeof guestResponseSchema>;

export const guestCreateBodySchema = zod
  .object({
    name: zod.string().min(1, 'Name is required'),
    idNumber: zod.string().nullable().optional(),
    contact: zod.string().nullable().optional(),
  })
  .strict();

export type GuestCreateBody = z.infer<typeof guestCreateBodySchema>;

export const guestUpdateBodySchema = zod
  .object({
    name: zod.string().min(1).optional(),
    idNumber: zod.string().nullable().optional(),
    contact: zod.string().nullable().optional(),
  })
  .strict();

export type GuestUpdateBody = z.infer<typeof guestUpdateBodySchema>;
