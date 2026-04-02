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

  const columns = useMemo<ColumnDef<RoomResponse>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ getValue }) => (
          <span className="font-mono tabular-nums">{String(getValue())}</span>
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

  const rows = list.kind === 'ok' ? list.rows : [];
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
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border/80 bg-card/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-5">
        <div className="border-l-4 border-l-primary pl-4">
          <h1 className="font-ui text-foreground text-2xl font-semibold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Inventory, nightly rates, and housekeeping status (tbl_room).
          </p>
        </div>
        <Button type="button" asChild>
          <Link to="/rooms/new">New room</Link>
        </Button>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Room list</CardTitle>
          <CardDescription>
            Rooms available for reservation pickers and housekeeping visibility.
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
                  <TableRow key={row.id}>
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
