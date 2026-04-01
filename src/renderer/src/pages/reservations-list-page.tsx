import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import type { JSX } from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@renderer/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@renderer/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@renderer/components/ui/table'
import { useGuestRoomCatalog } from '@renderer/features/reservations/use-guest-room-catalog'
import { useReservationsList } from '@renderer/features/reservations/use-reservations-list'
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app'
import type { GuestResponse } from '@shared/schemas/guest'
import type { ReservationResponse } from '@shared/schemas/reservation'
import type { RoomResponse } from '@shared/schemas/room'

function guestLabel(g: GuestResponse): string {
  return g.name
}

function roomLabel(r: RoomResponse): string {
  return `#${r.id} · ${r.roomType} (${r.status})`
}

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })

export function ReservationsListPage(): JSX.Element {
  const starHotel = useStarHotelApp()
  const { guests, rooms, loading: refsLoading, error: refsErr } = useGuestRoomCatalog(starHotel)
  const { list, reload } = useReservationsList(starHotel)
  const [deleteTarget, setDeleteTarget] = useState<ReservationResponse | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteErr, setDeleteErr] = useState<string | null>(null)

  const guestById = useMemo(() => new Map(guests.map((g) => [g.id, g])), [guests])
  const roomById = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms])

  const columns = useMemo<ColumnDef<ReservationResponse>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Res. ID',
        cell: ({ getValue }) => <span className="font-mono tabular-nums">{String(getValue())}</span>,
      },
      {
        id: 'guest',
        header: 'Guest',
        cell: ({ row }) => {
          const g = guestById.get(row.original.guestId)
          return g ? guestLabel(g) : `Guest #${row.original.guestId}`
        },
      },
      {
        id: 'room',
        header: 'Room',
        cell: ({ row }) => {
          const r = roomById.get(row.original.roomId)
          return r ? roomLabel(r) : `Room #${row.original.roomId}`
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
              <Link to={`/reservations/${row.original.id}`} aria-label={`Edit reservation ${row.original.id}`}>
                Edit
              </Link>
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              aria-label={`Delete reservation ${row.original.id}`}
              onClick={() => {
                setDeleteErr(null)
                setDeleteTarget(row.original)
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [guestById, roomById],
  )

  const rows = list.kind === 'ok' ? list.rows : []
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) {
      return
    }
    setDeleting(true)
    setDeleteErr(null)
    try {
      await starHotel.api.reservations.delete(deleteTarget.id)
      setDeleteTarget(null)
      await reload()
    } catch (err) {
      setDeleteErr(starHotel.formatEmbeddedApiUserMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage stays — front-desk MVP (Epic E5).
          </p>
        </div>
        <Button type="button" asChild>
          <Link to="/reservations/new">New reservation</Link>
        </Button>
      </div>

      {refsErr ? (
        <p className="text-destructive mb-4 text-sm" role="alert">
          Could not load guest or room lists: {refsErr}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Reservation list</CardTitle>
          <CardDescription>
            {refsLoading ? 'Loading reference data…' : `${guests.length} guests, ${rooms.length} rooms in catalog.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {list.kind === 'loading' ? (
            <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
              Loading reservations…
            </p>
          ) : null}
          {list.kind === 'err' ? (
            <p className="text-destructive text-sm" role="alert">
              {list.message}
            </p>
          ) : null}
          {list.kind === 'ok' && list.rows.length === 0 ? (
            <p className="text-muted-foreground text-sm" role="status">
              No reservations yet. Use <span className="font-medium">New reservation</span> to add one.
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
            setDeleteTarget(null)
            setDeleteErr(null)
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
                setDeleteTarget(null)
                setDeleteErr(null)
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" disabled={deleting} onClick={() => void confirmDelete()}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
