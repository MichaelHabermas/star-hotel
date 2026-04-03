import { Button } from '@renderer/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@renderer/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@renderer/components/ui/table';
import { useGuestRoomCatalog } from '@renderer/features/reservations/use-guest-room-catalog';
import { useReservationsList } from '@renderer/features/reservations/use-reservations-list';
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import type { GuestResponse } from '@shared/schemas/guest';
import type { ReservationResponse } from '@shared/schemas/reservation';
import type { RoomResponse } from '@shared/schemas/room';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function guestLabel(g: GuestResponse): string {
  return g.name;
}

function roomLabel(r: RoomResponse): string {
  return `#${r.id} · ${r.roomType} (${r.status})`;
}

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

export function ReservationsListPage(): JSX.Element {
  const starHotel = useStarHotelApp();
  const {
    guests,
    rooms,
    loading: refsLoading,
    error: refsErr,
    reload: reloadCatalog,
  } = useGuestRoomCatalog(starHotel);
  const { list, reload } = useReservationsList(starHotel);
  const [deleteTarget, setDeleteTarget] = useState<ReservationResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);

  const guestById = useMemo(() => new Map(guests.map((g) => [g.id, g])), [guests]);
  const roomById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);

  const columns = useMemo<ColumnDef<ReservationResponse>[]>(
    () => [
      {
        id: 'reservation',
        header: 'Booking',
        cell: ({ row }) => (
          <button
            type="button"
            className="text-left"
            onClick={() => setSelectedReservationId(row.original.id)}
            aria-label={`Select reservation ${row.original.id}`}
          >
            <span className="font-mono font-semibold tabular-nums">#{row.original.id}</span>
          </button>
        ),
      },
      {
        id: 'guest',
        header: 'Guest',
        cell: ({ row }) => {
          const g = guestById.get(row.original.guestId);
          return g ? guestLabel(g) : `Guest #${row.original.guestId}`;
        },
      },
      {
        id: 'room',
        header: 'Room',
        cell: ({ row }) => {
          const r = roomById.get(row.original.roomId);
          return r ? roomLabel(r) : `Room #${row.original.roomId}`;
        },
      },
      {
        accessorKey: 'checkInDate',
        header: 'Check-in',
      },
      {
        accessorKey: 'checkOutDate',
        header: 'Check-out',
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total',
        cell: ({ getValue }) => money.format(Number(getValue())),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link
                to={`/reservations/${row.original.id}`}
                aria-label={`Edit reservation ${row.original.id}`}
              >
                Edit
              </Link>
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              aria-label={`Delete reservation ${row.original.id}`}
              onClick={() => {
                setDeleteErr(null);
                setDeleteTarget(row.original);
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [guestById, roomById],
  );

  const rows = list.kind === 'ok' ? list.rows : [];
  const selectedReservation =
    selectedReservationId === null
      ? (rows[0] ?? null)
      : (rows.find((reservation) => reservation.id === selectedReservationId) ?? rows[0] ?? null);
  const selectedGuest = selectedReservation
    ? (guestById.get(selectedReservation.guestId) ?? null)
    : null;
  const selectedRoom = selectedReservation
    ? (roomById.get(selectedReservation.roomId) ?? null)
    : null;
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) {
      return;
    }
    setDeleting(true);
    setDeleteErr(null);
    try {
      await starHotel.api.reservations.delete(deleteTarget.id);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      setDeleteErr(starHotel.formatEmbeddedApiUserMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border/80 bg-card/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-5">
        <div className="border-l-4 border-l-primary pl-4">
          <h1 className="font-ui text-foreground text-2xl font-semibold tracking-tight">
            Booking ledger
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Front-desk bookings, room assignments, and stay totals from the legacy check-in path.
          </p>
        </div>
        <Button type="button" asChild>
          <Link to="/reservations/new">New booking</Link>
        </Button>
      </div>

      {refsErr ? (
        <div
          className="mb-4 flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p className="text-destructive text-sm">Could not load guest or room lists: {refsErr}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void reloadCatalog()}>
            Retry catalog
          </Button>
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <Card className="gap-4 py-4">
          <CardHeader className="pb-0">
            <CardTitle className="font-ui text-base">Desk flow</CardTitle>
            <CardDescription>
              Review the booking ledger, select a stay, then open the booking card or folio.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg border border-border/70 bg-background/80 p-3">
              <p className="font-ui text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Guest
              </p>
              <p className="mt-2 font-medium">{selectedGuest?.name ?? 'Select booking'}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/80 p-3">
              <p className="font-ui text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Room
              </p>
              <p className="mt-2 font-medium">
                {selectedRoom
                  ? `Room ${selectedRoom.roomNumber ?? selectedRoom.id}`
                  : 'Select booking'}
              </p>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/80 p-3">
              <p className="font-ui text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Total
              </p>
              <p className="mt-2 font-medium">
                {selectedReservation ? money.format(selectedReservation.totalAmount) : '—'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-4 py-4">
          <CardHeader className="pb-0">
            <CardTitle className="font-ui text-base">Booking card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {selectedReservation ? (
              <>
                <p className="font-ui text-lg font-semibold">Booking #{selectedReservation.id}</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                  <dt className="text-muted-foreground">Guest</dt>
                  <dd>{selectedGuest?.name ?? `Guest #${selectedReservation.guestId}`}</dd>
                  <dt className="text-muted-foreground">Room</dt>
                  <dd>
                    {selectedRoom
                      ? `Room ${selectedRoom.roomNumber ?? selectedRoom.id}`
                      : `Room #${selectedReservation.roomId}`}
                  </dd>
                  <dt className="text-muted-foreground">Stay</dt>
                  <dd>
                    {selectedReservation.checkInDate} → {selectedReservation.checkOutDate}
                  </dd>
                </dl>
                <div className="flex flex-col gap-2">
                  <Button type="button" asChild>
                    <Link to={`/reservations/${selectedReservation.id}`}>Open booking card</Link>
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to={`/reports/folio/${selectedReservation.id}`}>Open folio</Link>
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Select a booking from the ledger to inspect it.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Booking ledger</CardTitle>
          <CardDescription>
            {refsLoading
              ? 'Loading reference data…'
              : `${guests.length} guests, ${rooms.length} rooms in catalog.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {list.kind === 'loading' ? (
            <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
              Loading reservations…
            </p>
          ) : null}
          {list.kind === 'err' ? (
            <div
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              role="alert"
            >
              <p className="text-destructive text-sm">{list.message}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => void reload()}>
                Retry
              </Button>
            </div>
          ) : null}
          {list.kind === 'ok' && list.rows.length === 0 ? (
            <p className="text-muted-foreground text-sm" role="status">
              No bookings yet. Use <span className="font-medium">New booking</span> to add one.
            </p>
          ) : null}
          {list.kind === 'ok' && list.rows.length > 0 ? (
            <Table aria-label="Reservations">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={
                      selectedReservation?.id === row.original.id ? 'selected' : undefined
                    }
                    className={
                      selectedReservation?.id === row.original.id ? 'bg-muted/40' : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteErr(null);
          }
        }}
      >
        <DialogContent aria-describedby="delete-reservation-desc">
          <DialogHeader>
            <DialogTitle>Delete reservation?</DialogTitle>
            <DialogDescription id="delete-reservation-desc">
              {deleteTarget
                ? `This will permanently remove reservation #${deleteTarget.id} (${deleteTarget.checkInDate} → ${deleteTarget.checkOutDate}).`
                : null}
            </DialogDescription>
          </DialogHeader>
          {deleteErr ? (
            <p className="text-destructive text-sm" role="alert">
              {deleteErr}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteErr(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
