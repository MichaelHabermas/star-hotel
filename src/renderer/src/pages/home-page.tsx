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
import { apiClient } from '@renderer/lib/api-client'

export function HomePage(): JSX.Element {
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
            <span className="font-mono">{window.starHotel.platform}</span>
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              await apiClient.ping()
              console.info('[apiClient] ping ok (stub until E4)')
            }}
          >
            Test API stub
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
