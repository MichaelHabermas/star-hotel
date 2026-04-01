import { useEffect, useState } from 'react'
import type { StarHotelApp } from '@renderer/lib/star-hotel-app'
import type { GuestResponse } from '@shared/schemas/guest'
import type { RoomResponse } from '@shared/schemas/room'

export type GuestRoomCatalogState = {
  readonly guests: GuestResponse[]
  readonly rooms: RoomResponse[]
  readonly loading: boolean
  readonly error: string | null
}

/** Loads guest + room lists for reservation pickers (shared by list and form screens). */
export function useGuestRoomCatalog(app: StarHotelApp): GuestRoomCatalogState {
  const [guests, setGuests] = useState<GuestResponse[]>([])
  const [rooms, setRooms] = useState<RoomResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [g, r] = await Promise.all([app.api.guests.list({}), app.api.rooms.list({})])
        if (!cancelled) {
          setGuests(g)
          setRooms(r)
        }
      } catch (err) {
        if (!cancelled) {
          setError(app.formatEmbeddedApiUserMessage(err))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [app])

  return { guests, rooms, loading, error }
}
