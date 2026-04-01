import type { JSX } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Hotel } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@renderer/components/ui/card'
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app'

export function HomePage(): JSX.Element {
  const starHotel = useStarHotelApp()
  const [reservationSmoke, setReservationSmoke] = useState<
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'ok'; count: number }
    | { kind: 'err'; message: string }
  >({ kind: 'idle' })

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Hotel className="size-8 text-primary" aria-hidden />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Star Hotel</h1>
          <p className="text-muted-foreground text-sm">
            Desktop shell — open{' '}
            <Link to="/reservations" className="text-primary font-medium underline-offset-4 hover:underline">
              Reservations
            </Link>{' '}
            for Epic E5 CRUD.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Developer experience</CardTitle>
          <CardDescription>
            Electron + Vite + React 19 + Tailwind v4 + shadcn/ui baseline. Embedded Express API is
            reached only through <span className="font-mono">StarHotelApp.api</span> (Epic E4).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            Preload bridge (read-only):{' '}
            <span className="font-mono">{starHotel.getEnvironment().platform}</span>
          </p>
          <p className="text-muted-foreground text-sm">
            API base: <span className="font-mono">{starHotel.getEnvironment().apiBaseUrl}</span>
          </p>
          {starHotel.getEnvironment().platform === 'unknown' ? (
            <p className="text-muted-foreground text-xs">
              Plain browser preview: IPC needs Electron (<span className="font-mono">pnpm dev</span>). API
              health still works if the embedded server is running.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                try {
                  await starHotel.pingEmbeddedApi()
                  console.info('[starHotelApp] embedded API health ok')
                } catch (err) {
                  console.warn('[starHotelApp] embedded API health failed', err)
                }
              }}
            >
              Test API health
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  await starHotel.pingIpc()
                  console.info('[starHotelApp] IPC ping ok')
                } catch (err) {
                  console.warn('[starHotelApp] IPC ping failed', err)
                }
              }}
            >
              Test IPC
            </Button>
            <Button
              type="button"
              variant="default"
              disabled={reservationSmoke.kind === 'loading'}
              onClick={async () => {
                setReservationSmoke({ kind: 'loading' })
                try {
                  const rows = await starHotel.api.reservations.list({})
                  setReservationSmoke({ kind: 'ok', count: rows.length })
                } catch (err) {
                  setReservationSmoke({
                    kind: 'err',
                    message: starHotel.formatEmbeddedApiUserMessage(err),
                  })
                }
              }}
            >
              List reservations
            </Button>
          </div>
          {reservationSmoke.kind === 'ok' ? (
            <p className="text-muted-foreground text-sm" role="status">
              Reservations loaded: {reservationSmoke.count} row(s).
            </p>
          ) : null}
          {reservationSmoke.kind === 'err' ? (
            <p className="text-destructive text-sm" role="alert">
              {reservationSmoke.message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
