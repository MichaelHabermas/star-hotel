import { z } from 'zod';

export const roomIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const roomListQuerySchema = z
  .object({
    status: z.string().min(1).optional(),
  })
  .strict();

export type RoomListQuery = z.infer<typeof roomListQuerySchema>;

export const roomResponseSchema = z.object({
  id: z.number(),
  roomType: z.string(),
  price: z.number(),
  status: z.string(),
});

export type RoomResponse = z.infer<typeof roomResponseSchema>;

export const roomCreateBodySchema = z
  .object({
    roomType: z.string().min(1, 'Room type is required'),
    price: z.number().finite().nonnegative('Price must be zero or positive'),
    status: z.string().min(1, 'Status is required'),
  })
  .strict();

export type RoomCreateBody = z.infer<typeof roomCreateBodySchema>;

export const roomUpdateBodySchema = z
  .object({
    roomType: z.string().min(1).optional(),
    price: z.number().finite().nonnegative().optional(),
    status: z.string().min(1).optional(),
  })
  .strict();

export type RoomUpdateBody = z.infer<typeof roomUpdateBodySchema>;
