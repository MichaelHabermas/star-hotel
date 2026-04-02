import { Button } from '@renderer/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@renderer/components/ui/card';
import { runPerfSmoke, type PerfSmokeResult } from '@renderer/lib/perf-measurements';
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import { capturePostHogWorkflow } from '@renderer/telemetry/renderer-telemetry';
import { Building2, CalendarRange, FileText, Hotel, Users } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const hubCards: readonly {
  readonly title: string;
  readonly description: string;
  readonly to: string | null;
  readonly icon: typeof Hotel;
}[] = [
  {
    title: 'Reservations',
    description: 'Stays, check-in dates, and totals — primary front-desk flow.',
    to: '/reservations',
    icon: CalendarRange,
  },
  {
    title: 'Rooms',
    description: 'Inventory, nightly rates, and room status.',
    to: '/rooms',
    icon: Building2,
  },
  {
    title: 'Guests',
    description: 'Guest directory and contact details.',
    to: '/guests',
    icon: Users,
  },
  {
    title: 'Reports',
    description: 'Folio and operational print views (Epic E9 — not wired yet).',
    to: null,
    icon: FileText,
  },
];

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
    <div className="mx-auto max-w-5xl flex-col gap-8 p-4 md:p-6">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <Hotel className="text-primary size-10 shrink-0" aria-hidden />
          <div>
            <h1 className="font-display text-foreground text-2xl font-semibold tracking-tight">
              Operations hub
            </h1>
            <p className="text-muted-foreground text-sm">
              Front desk, inventory, and guests — same surface as the legacy main menu, rebuilt for
              speed. Use the header or the cards below to open each module.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {hubCards.map(({ title, description, to, icon: Icon }) => (
          <Card key={title} className="border-border/80 transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
              <div className="bg-muted/60 rounded-md p-2">
                <Icon className="text-primary size-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="font-ui text-base">{title}</CardTitle>
                <CardDescription className="mt-1">{description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {to ? (
                <Button type="button" variant="secondary" size="sm" asChild>
                  <Link to={to}>Open</Link>
                </Button>
              ) : (
                <Button type="button" variant="outline" size="sm" disabled>
                  Coming in E9
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Developer experience</CardTitle>
          <CardDescription>
            Electron + Vite + React 19 + Tailwind v4 + shadcn/ui. Embedded Express API is reached
            only through <span className="font-mono">StarHotelApp.api</span> (Epic E4).
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
              Plain browser preview: IPC needs Electron (<span className="font-mono">pnpm dev</span>
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
    </div>
  );
}
