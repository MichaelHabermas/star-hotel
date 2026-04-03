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
import { useRoomsList } from '@renderer/features/rooms/use-rooms-list';
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import { ROOM_STATUS_DASHBOARD_CLASSES, ROOM_STATUS_VALUES } from '@shared/room-status';
import type { RoomResponse } from '@shared/schemas/room';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

export function RoomsListPage(): JSX.Element {
  const starHotel = useStarHotelApp();
  const { list, reload } = useRoomsList(starHotel);
  const [deleteTarget, setDeleteTarget] = useState<RoomResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const columns = useMemo<ColumnDef<RoomResponse>[]>(
    () => [
      {
        id: 'room',
        header: 'Room',
        cell: ({ row }) => (
          <button
            type="button"
            className="text-left"
            onClick={() => setSelectedRoomId(row.original.id)}
            aria-label={`Select room ${row.original.roomNumber ?? row.original.id}`}
          >
            <span className="font-mono font-semibold tabular-nums">
              {row.original.roomNumber ?? `#${row.original.id}`}
            </span>
          </button>
        ),
      },
      {
        accessorKey: 'roomType',
        header: 'Type',
      },
      {
        accessorKey: 'price',
        header: 'Nightly rate',
        cell: ({ getValue }) => money.format(Number(getValue())),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded px-2 py-1 text-xs font-medium ${ROOM_STATUS_DASHBOARD_CLASSES[row.original.status]}`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to={`/rooms/${row.original.id}`} aria-label={`Edit room ${row.original.id}`}>
                Edit
              </Link>
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              aria-label={`Delete room ${row.original.id}`}
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
    [],
  );

  const rows = useMemo(() => (list.kind === 'ok' ? list.rows : []), [list]);
  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(ROOM_STATUS_VALUES.map((status) => [status, 0])) as Record<
      (typeof ROOM_STATUS_VALUES)[number],
      number
    >;
    for (const row of rows) {
      counts[row.status] += 1;
    }
    return counts;
  }, [rows]);
  const selectedRoom =
    selectedRoomId === null
      ? (rows[0] ?? null)
      : (rows.find((room) => room.id === selectedRoomId) ?? rows[0] ?? null);
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
      await starHotel.api.rooms.delete(deleteTarget.id);
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
          <h1 className="font-ui text-foreground text-2xl font-semibold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Room maintenance board for number, type, rate, and operational condition.
          </p>
        </div>
        <Button type="button" asChild>
          <Link to="/rooms/new">New room</Link>
        </Button>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <Card className="gap-4 py-4">
          <CardHeader className="pb-0">
            <CardTitle className="font-ui text-base">Status summary</CardTitle>
            <CardDescription>Keep condition and occupancy legible before editing.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {ROOM_STATUS_VALUES.map((status) => (
              <div
                key={status}
                className="flex items-center gap-2 rounded border border-border/70 bg-background/80 px-3 py-2 text-xs"
              >
                <span
                  className={`inline-block size-3 rounded-sm border ${ROOM_STATUS_DASHBOARD_CLASSES[status]}`}
                  aria-hidden
                />
                <span className="font-medium">{status}</span>
                <span className="font-mono text-muted-foreground tabular-nums">
                  {statusCounts[status]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="gap-4 py-4">
          <CardHeader className="pb-0">
            <CardTitle className="font-ui text-base">Room card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {selectedRoom ? (
              <>
                <p className="font-ui text-lg font-semibold">
                  Room {selectedRoom.roomNumber ?? selectedRoom.id}
                </p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>{selectedRoom.roomType}</dd>
                  <dt className="text-muted-foreground">Rate</dt>
                  <dd className="font-mono">{money.format(selectedRoom.price)}</dd>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>{selectedRoom.status}</dd>
                </dl>
                <div className="flex flex-col gap-2">
                  <Button type="button" asChild>
                    <Link to={`/rooms/${selectedRoom.id}`}>Open room card</Link>
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to={`/reservations/new?roomId=${selectedRoom.id}`}>Start check-in</Link>
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Select a room from the list to inspect it.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Room maintenance ledger</CardTitle>
          <CardDescription>
            Select a room to inspect it, then open the maintenance card for editing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {list.kind === 'loading' ? (
            <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
              Loading rooms…
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
              No rooms yet. Use <span className="font-medium">New room</span> to add one.
            </p>
          ) : null}
          {list.kind === 'ok' && list.rows.length > 0 ? (
            <Table aria-label="Rooms">
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
                    data-state={selectedRoom?.id === row.original.id ? 'selected' : undefined}
                    className={selectedRoom?.id === row.original.id ? 'bg-muted/40' : undefined}
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
        <DialogContent aria-describedby="delete-room-desc">
          <DialogHeader>
            <DialogTitle>Delete room?</DialogTitle>
            <DialogDescription id="delete-room-desc">
              {deleteTarget
                ? `Remove room #${deleteTarget.id} (${deleteTarget.roomType})? You cannot delete a room that still has reservations.`
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
