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
import { Input } from '@renderer/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@renderer/components/ui/table';
import { useGuestsList } from '@renderer/features/guests/use-guests-list';
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import type { GuestResponse } from '@shared/schemas/guest';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export function GuestsListPage(): JSX.Element {
  const starHotel = useStarHotelApp();
  const { list, reload } = useGuestsList(starHotel);
  const [deleteTarget, setDeleteTarget] = useState<GuestResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [findQuery, setFindQuery] = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null);

  const columns = useMemo<ColumnDef<GuestResponse>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <button
            type="button"
            className="text-left"
            onClick={() => setSelectedGuestId(row.original.id)}
            aria-label={`Select guest ${row.original.name}`}
          >
            <span className="font-medium">{row.original.name}</span>
          </button>
        ),
      },
      {
        accessorKey: 'idNumber',
        header: 'ID / Ref',
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ?? '—';
        },
      },
      {
        accessorKey: 'contact',
        header: 'Contact',
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ?? '—';
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

  const rows = useMemo(() => {
    if (list.kind !== 'ok') {
      return [];
    }
    const q = findQuery.trim().toLowerCase();
    if (!q) {
      return list.rows;
    }
    return list.rows.filter((g) => {
      const name = g.name.toLowerCase();
      const contact = (g.contact ?? '').toLowerCase();
      const idNum = (g.idNumber ?? '').toLowerCase();
      return name.includes(q) || contact.includes(q) || idNum.includes(q);
    });
  }, [list, findQuery]);
  const selectedGuest =
    selectedGuestId === null ? rows[0] ?? null : rows.find((guest) => guest.id === selectedGuestId) ?? rows[0] ?? null;

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
      await starHotel.api.guests.delete(deleteTarget.id);
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
          <h1 className="font-ui text-foreground text-2xl font-semibold tracking-tight">Guests</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Find-customer desk for reservations, contact lookup, and guest maintenance.
          </p>
        </div>
        <Button type="button" asChild>
          <Link to="/guests/new">New guest</Link>
        </Button>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <Card className="gap-4 py-4">
          <CardHeader className="pb-0">
            <CardTitle className="font-ui text-base">Find guest</CardTitle>
            <CardDescription>Search by name, contact, or ID reference before opening the guest card.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-xl space-y-1">
              <label className="text-muted-foreground text-xs font-medium" htmlFor="guest-find">
                Find guest
              </label>
              <Input
                id="guest-find"
                placeholder="Name, contact, or ID reference"
                value={findQuery}
                onChange={(ev) => setFindQuery(ev.target.value)}
                autoComplete="off"
              />
            </div>
            <p className="text-muted-foreground text-sm">
              Use the list below to open a guest card or jump into booking once identity is confirmed.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-4 py-4">
          <CardHeader className="pb-0">
            <CardTitle className="font-ui text-base">Guest card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {selectedGuest ? (
              <>
                <p className="font-ui text-lg font-semibold">{selectedGuest.name}</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                  <dt className="text-muted-foreground">ID / Ref</dt>
                  <dd>{selectedGuest.idNumber ?? '—'}</dd>
                  <dt className="text-muted-foreground">Contact</dt>
                  <dd>{selectedGuest.contact ?? '—'}</dd>
                </dl>
                <div className="flex flex-col gap-2">
                  <Button type="button" asChild>
                    <Link to={`/guests/${selectedGuest.id}`}>Open guest card</Link>
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to={`/reservations/new?guestId=${selectedGuest.id}`}>Start booking</Link>
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Select a guest from the list to inspect the card.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Guest lookup ledger</CardTitle>
          <CardDescription>Lookup first, then edit the guest card if details need changing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {list.kind === 'ok' && list.rows.length > 0 ? (
            <p className="text-muted-foreground text-sm">
              {rows.length} matching guest record(s).
            </p>
          ) : null}
          {list.kind === 'loading' ? (
            <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
              Loading guests…
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
                  <TableRow
                    key={row.id}
                    data-state={selectedGuest?.id === row.original.id ? 'selected' : undefined}
                    className={selectedGuest?.id === row.original.id ? 'bg-muted/40' : undefined}
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
