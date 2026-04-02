import { Button } from '@renderer/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@renderer/components/ui/card';
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import type { FolioReportResponse } from '@shared/schemas/report';
import type { JSX } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
const dateTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function FolioReportPage(): JSX.Element {
  const starHotel = useStarHotelApp();
  const { reservationId: idParam } = useParams<{ reservationId: string }>();
  const resId = idParam ? Number.parseInt(idParam, 10) : NaN;
  const valid = Number.isFinite(resId) && resId > 0;

  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [data, setData] = useState<FolioReportResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!valid) {
      return;
    }
    setLoadState('loading');
    setErr(null);
    try {
      const folio = await starHotel.api.reports.getFolio(resId);
      setData(folio);
      setLoadState('ok');
    } catch (e) {
      setErr(starHotel.formatEmbeddedApiUserMessage(e));
      setLoadState('err');
    }
  }, [starHotel, resId, valid]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!valid) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-destructive text-sm" role="alert">
          Invalid reservation id.
        </p>
        <Button type="button" variant="link" className="mt-2 px-0" asChild>
          <Link to="/reservations">Back to reservations</Link>
        </Button>
      </div>
    );
  }

  if (loadState === 'loading' || loadState === 'idle') {
    return (
      <div className="mx-auto max-w-2xl p-6" data-print-report>
        <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
          Loading folio…
        </p>
      </div>
    );
  }

  if (loadState === 'err' || !data) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6" data-print-report>
        <p className="text-destructive text-sm" role="alert">
          {err ?? 'Could not load folio.'}
        </p>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button type="button" variant="outline" onClick={() => void load()}>
            Retry
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link to="/reservations">Back to reservations</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { reservation, guest, room, generatedAt } = data;

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6" data-print-report>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link to={`/reservations/${resId}`}>← Reservation #{resId}</Link>
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void load()}>
            Refresh
          </Button>
          <Button type="button" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      <Card className="border-border/80 shadow-sm print:border-0 print:shadow-none">
        <CardHeader className="border-border/60 border-b print:border-border">
          <CardTitle className="font-display text-xl tracking-tight">
            Guest folio / receipt
          </CardTitle>
          <CardDescription className="font-ui">
            Generated {dateTime.format(new Date(generatedAt))}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <section aria-labelledby="folio-stay-heading">
            <h2
              id="folio-stay-heading"
              className="font-ui text-foreground mb-3 text-sm font-semibold"
            >
              Stay
            </h2>
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-xs uppercase">Confirmation</dt>
                <dd className="font-mono text-sm">#{reservation.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs uppercase">Nights</dt>
                <dd className="text-sm">{reservation.nights}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs uppercase">Check-in</dt>
                <dd className="text-sm">{reservation.checkInDate}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs uppercase">Check-out</dt>
                <dd className="text-sm">{reservation.checkOutDate}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground text-xs uppercase">Total</dt>
                <dd className="font-ui text-lg font-semibold">
                  {money.format(reservation.totalAmount)}
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="folio-guest-heading">
            <h2
              id="folio-guest-heading"
              className="font-ui text-foreground mb-3 text-sm font-semibold"
            >
              Guest
            </h2>
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground text-xs uppercase">Name</dt>
                <dd className="text-sm">{guest.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs uppercase">ID number</dt>
                <dd className="text-sm">{guest.idNumber ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs uppercase">Contact</dt>
                <dd className="text-sm">{guest.contact ?? '—'}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="folio-room-heading">
            <h2
              id="folio-room-heading"
              className="font-ui text-foreground mb-3 text-sm font-semibold"
            >
              Room
            </h2>
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-xs uppercase">Room</dt>
                <dd className="font-mono text-sm">#{room.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs uppercase">Type</dt>
                <dd className="text-sm">{room.roomType}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs uppercase">Rate / night</dt>
                <dd className="text-sm">{money.format(room.price)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs uppercase">Status</dt>
                <dd className="text-sm">{room.status}</dd>
              </div>
            </dl>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
