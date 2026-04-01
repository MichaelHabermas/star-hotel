import { z } from 'zod'

export const roomIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const roomListQuerySchema = z
  .object({
    status: z.string().min(1).optional(),
  })
  .strict()

export type RoomListQuery = z.infer<typeof roomListQuerySchema>

export const roomResponseSchema = z.object({
  id: z.number(),
  roomType: z.string(),
  price: z.number(),
  status: z.string(),
})

export type RoomResponse = z.infer<typeof roomResponseSchema>
