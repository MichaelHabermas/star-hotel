import { Button } from '@renderer/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@renderer/components/ui/card';
import { Input } from '@renderer/components/ui/input';
import { Label } from '@renderer/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@renderer/components/ui/table';
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import type { DaySheetReportResponse } from '@shared/schemas/report';
import type { JSX } from 'react';
import { useCallback, useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const pct = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function DaySheetReportPage(): JSX.Element {
  const starHotel = useStarHotelApp();
  const formId = useId();
  const dateInputId = `${formId}-date`;

  const [date, setDate] = useState(todayIsoDate);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [data, setData] = useState<DaySheetReportResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadState('loading');
    setErr(null);
    try {
      const sheet = await starHotel.api.reports.getDaySheet(date);
      setData(sheet);
      setLoadState('ok');
    } catch (e) {
      setErr(starHotel.formatEmbeddedApiUserMessage(e));
      setLoadState('err');
    }
  }, [starHotel, date]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6" data-print-report>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link to="/">← Home</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.print()}
          disabled={loadState !== 'ok'}
        >
          Print
        </Button>
      </div>

      <Card className="border-border/80 shadow-sm print:border-0 print:shadow-none">
        <CardHeader className="border-border/60 border-b print:border-border">
          <CardTitle className="font-display text-xl tracking-tight">Day sheet</CardTitle>
          <CardDescription className="font-ui">
            Rooms with an active stay on the selected calendar date (half-open stay model: check-in
            ≤ date &lt; check-out).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-wrap items-end gap-4 print:hidden">
            <div className="space-y-2">
              <Label htmlFor={dateInputId}>Date</Label>
              <Input
                id={dateInputId}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-auto font-mono"
              />
            </div>
            <Button type="button" onClick={() => void load()}>
              Run report
            </Button>
          </div>

          {loadState === 'loading' || loadState === 'idle' ? (
            <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
              Loading day sheet…
            </p>
          ) : null}

          {loadState === 'err' ? (
            <p className="text-destructive text-sm" role="alert">
              {err ?? 'Could not load report.'}
            </p>
          ) : null}

          {loadState === 'ok' && data ? (
            <div className="space-y-4">
              <dl className="font-ui grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground text-xs uppercase">Date</dt>
                  <dd className="font-mono text-sm">{data.date}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase">Occupied rooms</dt>
                  <dd className="text-sm">
                    {data.occupancyCount} / {data.totalRooms}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs uppercase">Occupancy rate</dt>
                  <dd className="text-sm">{pct.format(data.occupancyRate)}</dd>
                </div>
              </dl>

              {data.lines.length === 0 ? (
                <p className="text-muted-foreground text-sm" role="status">
                  No active stays for this date.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Room</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead className="font-mono">Stay</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.lines.map((line) => (
                      <TableRow key={`${line.reservationId}-${line.roomId}`}>
                        <TableCell className="font-mono">#{line.roomId}</TableCell>
                        <TableCell>{line.roomType}</TableCell>
                        <TableCell>{line.guestName}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {line.checkInDate} → {line.checkOutDate}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
