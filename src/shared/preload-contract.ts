import { z } from 'zod'

/** JSON-serializable surface exposed on `window.starHotel` (preload bridge). */
export const starHotelPreloadBridgeSchema = z.object({
  platform: z.string(),
  /** Base URL for the embedded Express API in main (e.g. `http://127.0.0.1:45123`). */
  apiBaseUrl: z.string().url(),
})

export type StarHotelPreloadAPI = z.infer<typeof starHotelPreloadBridgeSchema>
