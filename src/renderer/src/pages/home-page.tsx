import { Button } from '@renderer/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@renderer/components/ui/card';
import { RoomDashboard } from '@renderer/features/dashboard/room-dashboard';
import { runPerfSmoke, type PerfSmokeResult } from '@renderer/lib/perf-measurements';
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import { capturePostHogWorkflow } from '@renderer/telemetry/renderer-telemetry';
import { Hotel } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';

export function HomePage(): JSX.Element {
  const starHotel = useStarHotelApp();
  const [perfSmoke, setPerfSmoke] = useState<
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'ok'; result: PerfSmokeResult }
    | { kind: 'err'; message: string }
  >({ kind: 'idle' });
  const [reservationSmoke, setReservationSmoke] = useState<
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'ok'; count: number }
    | { kind: 'err'; message: string }
  >({ kind: 'idle' });

  return (
    <div className="mx-auto max-w-6xl flex-col gap-6 p-4 md:p-6">
      <div className="mb-3 flex items-center justify-between gap-4 border-b border-border/80 pb-3">
        <div className="flex items-center gap-3">
          <Hotel className="text-primary size-8 shrink-0" aria-hidden />
          <div>
            <h1 className="font-display text-foreground text-2xl font-semibold tracking-tight">
              Room board
            </h1>
            <p className="text-muted-foreground text-sm">
              Legacy front-desk board. Open booking from the room tile, edit room from the room
              menu, and use F1 to F4 for module switches.
            </p>
          </div>
        </div>
        <p className="text-muted-foreground hidden text-xs md:block">
          Esc board · F1 booking · F2 report · F3 customer · F4 room
        </p>
      </div>

      <RoomDashboard />

      {import.meta.env.DEV ? (
        <details className="group rounded-xl border border-dashed border-border/80 bg-card/40 p-3">
          <summary className="cursor-pointer list-none font-ui text-sm font-medium text-muted-foreground">
            Developer tools
          </summary>
          <Card className="mt-3 gap-3 py-4">
            <CardHeader className="pb-0">
              <CardTitle>Developer experience</CardTitle>
              <CardDescription>
                Electron + Vite + React 19 + Tailwind v4 + shadcn/ui. Embedded Express API is
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
                  Plain browser preview: IPC needs Electron (
                  <span className="font-mono">pnpm dev</span>
                  ). API health still works if the embedded server is running.
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await starHotel.pingEmbeddedApi();
                      console.info('[starHotelApp] embedded API health ok');
                    } catch (err) {
                      console.warn('[starHotelApp] embedded API health failed', err);
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
                      await starHotel.pingIpc();
                      console.info('[starHotelApp] IPC ping ok');
                    } catch (err) {
                      console.warn('[starHotelApp] IPC ping failed', err);
                    }
                  }}
                >
                  Test IPC
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={perfSmoke.kind === 'loading'}
                  onClick={async () => {
                    setPerfSmoke({ kind: 'loading' });
                    try {
                      const result = await runPerfSmoke(starHotel);
                      setPerfSmoke({ kind: 'ok', result });
                    } catch (err) {
                      setPerfSmoke({
                        kind: 'err',
                        message: err instanceof Error ? err.message : String(err),
                      });
                    }
                  }}
                >
                  Perf smoke (E7)
                </Button>
                <Button
                  type="button"
                  variant="default"
                  disabled={reservationSmoke.kind === 'loading'}
                  onClick={async () => {
                    setReservationSmoke({ kind: 'loading' });
                    try {
                      const rows = await starHotel.api.reservations.list({});
                      setReservationSmoke({ kind: 'ok', count: rows.length });
                      capturePostHogWorkflow('workflow_list_reservations', { count: rows.length });
                    } catch (err) {
                      setReservationSmoke({
                        kind: 'err',
                        message: starHotel.formatEmbeddedApiUserMessage(err),
                      });
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
              {perfSmoke.kind === 'ok' ? (
                <p className="text-muted-foreground text-xs font-mono" role="status">
                  Perf: HTTP health {perfSmoke.result.embeddedApiRttMs} ms · IPC{' '}
                  {perfSmoke.result.ipcRttMs} ms · GET /api/reservations{' '}
                  {perfSmoke.result.reservationListMs} ms (see docs/PERF.md)
                </p>
              ) : null}
              {perfSmoke.kind === 'err' ? (
                <p className="text-destructive text-sm" role="alert">
                  {perfSmoke.message}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </details>
      ) : null}
    </div>
  );
}
