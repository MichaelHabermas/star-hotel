import { z } from 'zod'
import type { IpcChannel } from './ipc/channels'

/** JSON-serializable fields exposed on `window.starHotel` (validated at preload load). */
export const starHotelPreloadBridgeSchema = z.object({
  platform: z.string(),
  /** Base URL for the embedded Express API in main (e.g. `http://127.0.0.1:45123`). */
  apiBaseUrl: z.string().url(),
})

export type StarHotelPreloadBridge = z.infer<typeof starHotelPreloadBridgeSchema>

/**
 * Full preload API: bridge data + non-JSON `invoke` (contextBridge can expose functions).
 * Use typed helpers in `ipc/typed-invoke.ts` for channel results (Zod-validated).
 */
export type StarHotelPreloadAPI = StarHotelPreloadBridge & {
  readonly invoke: (channel: IpcChannel, payload?: unknown) => Promise<unknown>
}
