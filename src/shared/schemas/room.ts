import type { z } from 'zod';
import { roomStatusSchema } from '../room-status';
import { z as zod } from './zod-openapi';

export const roomIdParamsSchema = zod.object({
  id: zod.coerce.number().int().positive(),
});

export const roomListQuerySchema = zod
  .object({
    status: roomStatusSchema.optional(),
  })
  .strict();

export type RoomListQuery = z.infer<typeof roomListQuerySchema>;

export const roomResponseSchema = zod.object({
  id: zod.number(),
  roomNumber: zod.string().nullable(),
  roomType: zod.string(),
  price: zod.number(),
  status: roomStatusSchema,
});

export type RoomResponse = z.infer<typeof roomResponseSchema>;

const roomNumberBodySchema = zod
  .string()
  .min(1, 'Room number is required')
  .max(16)
  .regex(/^[0-9A-Za-z-]+$/, 'Use letters, digits, or hyphen');

export const roomCreateBodySchema = zod
  .object({
    roomNumber: roomNumberBodySchema,
    roomType: zod.string().min(1, 'Room type is required'),
    price: zod.number().finite().nonnegative('Price must be zero or positive'),
    status: roomStatusSchema,
  })
  .strict();

export type RoomCreateBody = z.infer<typeof roomCreateBodySchema>;

export const roomUpdateBodySchema = zod
  .object({
    roomNumber: roomNumberBodySchema.optional(),
    roomType: zod.string().min(1).optional(),
    price: zod.number().finite().nonnegative().optional(),
    status: roomStatusSchema.optional(),
  })
  .strict();

export type RoomUpdateBody = z.infer<typeof roomUpdateBodySchema>;
