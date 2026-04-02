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
import { useGuestsList } from '@renderer/features/guests/use-guests-list'
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app'
import type { GuestResponse } from '@shared/schemas/guest'

export function GuestsListPage(): JSX.Element {
  const starHotel = useStarHotelApp()
  const { list, reload } = useGuestsList(starHotel)
  const [deleteTarget, setDeleteTarget] = useState<GuestResponse | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteErr, setDeleteErr] = useState<string | null>(null)

  const columns = useMemo<ColumnDef<GuestResponse>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ getValue }) => <span className="font-mono tabular-nums">{String(getValue())}</span>,
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'idNumber',
        header: 'ID / Ref',
        cell: ({ getValue }) => {
          const v = getValue() as string | null
          return v ?? '—'
        },
      },
      {
        accessorKey: 'contact',
        header: 'Contact',
        cell: ({ getValue }) => {
          const v = getValue() as string | null
          return v ?? '—'
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to={`/guests/${row.original.id}`} aria-label={`Edit guest ${row.original.id}`}>
                Edit
              </Link>
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              aria-label={`Delete guest ${row.original.id}`}
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
    [],
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
      await starHotel.api.guests.delete(deleteTarget.id)
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
          <h1 className="font-ui text-foreground text-2xl font-semibold tracking-tight">Guests</h1>
          <p className="text-muted-foreground text-sm">Guest records (tbl_guest).</p>
        </div>
        <Button type="button" asChild>
          <Link to="/guests/new">New guest</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guest directory</CardTitle>
          <CardDescription>Used by reservations and front-desk lookup.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {list.kind === 'loading' ? (
            <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
              Loading guests…
            </p>
          ) : null}
          {list.kind === 'err' ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" role="alert">
              <p className="text-destructive text-sm">{list.message}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => void reload()}>
                Retry
              </Button>
            </div>
          ) : null}
          {list.kind === 'ok' && list.rows.length === 0 ? (
            <p className="text-muted-foreground text-sm" role="status">
              No guests yet. Use <span className="font-medium">New guest</span> to add one.
            </p>
          ) : null}
          {list.kind === 'ok' && list.rows.length > 0 ? (
            <Table aria-label="Guests">
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
        <DialogContent aria-describedby="delete-guest-desc">
          <DialogHeader>
            <DialogTitle>Delete guest?</DialogTitle>
            <DialogDescription id="delete-guest-desc">
              {deleteTarget
                ? `Remove ${deleteTarget.name}? You cannot delete a guest who still has reservations.`
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
