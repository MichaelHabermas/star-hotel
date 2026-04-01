import type { JSX } from 'react'
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

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Hotel className="size-8 text-primary" aria-hidden />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Star Hotel</h1>
          <p className="text-muted-foreground text-sm">Desktop shell — Epic E1 scaffold</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Developer experience</CardTitle>
          <CardDescription>
            Electron + Vite + React 19 + Tailwind v4 + shadcn/ui baseline. Express and SQLite arrive
            in later epics.
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
