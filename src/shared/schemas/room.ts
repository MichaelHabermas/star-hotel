import type { z } from 'zod';
import { z as zod } from './zod-openapi';

export const roomIdParamsSchema = zod.object({
  id: zod.coerce.number().int().positive(),
});

export const roomListQuerySchema = zod
  .object({
    status: zod.string().min(1).optional(),
  })
  .strict();

export type RoomListQuery = z.infer<typeof roomListQuerySchema>;

export const roomResponseSchema = zod.object({
  id: zod.number(),
  roomType: zod.string(),
  price: zod.number(),
  status: zod.string(),
});

export type RoomResponse = z.infer<typeof roomResponseSchema>;

export const roomCreateBodySchema = zod
  .object({
    roomType: zod.string().min(1, 'Room type is required'),
    price: zod.number().finite().nonnegative('Price must be zero or positive'),
    status: zod.string().min(1, 'Status is required'),
  })
  .strict();

export type RoomCreateBody = z.infer<typeof roomCreateBodySchema>;

export const roomUpdateBodySchema = zod
  .object({
    roomType: zod.string().min(1).optional(),
    price: zod.number().finite().nonnegative().optional(),
    status: zod.string().min(1).optional(),
  })
  .strict();

export type RoomUpdateBody = z.infer<typeof roomUpdateBodySchema>;
