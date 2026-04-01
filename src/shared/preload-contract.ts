import { z } from 'zod'

/** JSON-serializable surface exposed on `window.starHotel` (preload bridge). */
export const starHotelPreloadBridgeSchema = z.object({
  platform: z.string(),
})

export type StarHotelPreloadAPI = z.infer<typeof starHotelPreloadBridgeSchema>
