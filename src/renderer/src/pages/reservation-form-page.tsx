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
import { Label } from '@renderer/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@renderer/components/ui/select';
import { useReservationEditor } from '@renderer/features/reservations/use-reservation-editor';
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app';
import type { JSX } from 'react';
import { useId } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

type ReservationFormPageProps = {
  readonly mode: 'create' | 'edit';
};

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

export function ReservationFormPage({ mode }: ReservationFormPageProps): JSX.Element {
  const starHotel = useStarHotelApp();
  const navigate = useNavigate();
  const { reservationId: idParam } = useParams<{ reservationId: string }>();
  const formId = useId();
  const guestSelectId = `${formId}-guest`;
  const roomSelectId = `${formId}-room`;
  const checkInId = `${formId}-checkin`;
  const checkOutId = `${formId}-checkout`;

  const editId = mode === 'edit' && idParam ? Number.parseInt(idParam, 10) : NaN;
  const editIdValid = mode === 'edit' && Number.isFinite(editId) && editId > 0;

  const editor = useReservationEditor(starHotel, { mode, editId, editIdValid, navigate });
  const { catalog, setDeleteErr, createPreview } = editor;
  const { guests, rooms, loading: refsLoading, error: refsErr, reload: reloadCatalog } = catalog;

  if (mode === 'edit' && !editIdValid) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <p className="text-destructive text-sm" role="alert">
          Invalid reservation id.
        </p>
        <Button type="button" variant="link" className="mt-2 px-0" asChild>
          <Link to="/reservations">Back to list</Link>
        </Button>
      </div>
    );
  }

  if (mode === 'edit' && (editor.loadState === 'loading' || editor.loadState === 'idle')) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
          Loading reservation…
        </p>
      </div>
    );
  }

  if (mode === 'edit' && editor.loadState === 'err') {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-6">
        <p className="text-destructive text-sm" role="alert">
          {editor.loadErr}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void editor.loadReservation()}>
            Retry
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link to="/reservations">Back to list</Link>
          </Button>
        </div>
      </div>
    );
  }

  const title = mode === 'create' ? 'New reservation' : `Edit reservation #${editId}`;
  const description =
    mode === 'create'
      ? 'Select guest, room, and stay dates. Estimated total uses the same nightly rate and night count as the server.'
      : 'Update stay details. Total is recalculated when dates or room change.';

  return (
    <div className="mx-auto max-w-lg p-4 md:p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link to="/reservations" aria-label="Back to reservations list">
            ← Reservations
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-ui text-lg">{title}</CardTitle>
          <CardDescription id={`${formId}-hint`}>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id={formId}
            onSubmit={(e) => void editor.onSubmit(e)}
            className="space-y-6"
            noValidate
            aria-describedby={`${formId}-hint`}
          >
            {refsErr ? (
              <div
                className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                role="alert"
              >
                <p className="text-destructive text-sm">
                  Could not load guests or rooms: {refsErr}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void reloadCatalog()}
                >
                  Retry
                </Button>
              </div>
            ) : null}
            {refsLoading ? (
              <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
                Loading guests and rooms…
              </p>
            ) : null}

            {!refsLoading && !refsErr && guests.length === 0 ? (
              <p className="text-muted-foreground text-sm" role="status">
                No guests in the database. Seed or create guests before adding a reservation.
              </p>
            ) : null}
            {!refsLoading && !refsErr && rooms.length === 0 ? (
              <p className="text-muted-foreground text-sm" role="status">
                No rooms in the database. Seed or create rooms before adding a reservation.
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor={guestSelectId}>Guest</Label>
              <Select
                value={editor.guestId === '' ? undefined : editor.guestId}
                onValueChange={editor.setGuestId}
                disabled={refsLoading || guests.length === 0}
                required
              >
                <SelectTrigger id={guestSelectId} aria-required className="w-full">
                  <SelectValue placeholder="Choose a guest" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.name}
                      {g.contact ? ` — ${g.contact}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={roomSelectId}>Room</Label>
              <Select
                value={editor.roomId === '' ? undefined : editor.roomId}
                onValueChange={editor.setRoomId}
                disabled={refsLoading || rooms.length === 0}
                required
              >
                <SelectTrigger id={roomSelectId} aria-required className="w-full">
                  <SelectValue placeholder="Choose a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      #{r.id} · {r.roomType} — {money.format(r.price)} ({r.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={checkInId}>Check-in date</Label>
                <Input
                  id={checkInId}
                  type="date"
                  value={editor.checkInDate}
                  onChange={(ev) => editor.setCheckInDate(ev.target.value)}
                  required
                  aria-required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={checkOutId}>Check-out date</Label>
                <Input
                  id={checkOutId}
                  type="date"
                  value={editor.checkOutDate}
                  onChange={(ev) => editor.setCheckOutDate(ev.target.value)}
                  required
                  aria-required
                />
              </div>
            </div>

            {mode === 'create' && createPreview.hint ? (
              <p className="text-muted-foreground text-sm" role="status">
                {createPreview.hint}
              </p>
            ) : null}
            {mode === 'create' &&
            createPreview.nights !== null &&
            createPreview.total !== null &&
            !createPreview.hint ? (
              <div
                className="border-border bg-muted/30 rounded-lg border px-4 py-3 text-sm"
                role="status"
                aria-live="polite"
              >
                <p className="text-muted-foreground">
                  Estimated stay:{' '}
                  <span className="text-foreground font-medium">
                    {createPreview.nights} night(s)
                  </span>
                </p>
                <p className="text-muted-foreground mt-1">
                  Estimated total:{' '}
                  <span className="text-foreground font-semibold tabular-nums">
                    {money.format(createPreview.total)}
                  </span>
                </p>
              </div>
            ) : null}

            {mode === 'edit' && editor.totalAmount !== null ? (
              <p className="text-muted-foreground text-sm">
                Current total:{' '}
                <span className="text-foreground font-medium">
                  {money.format(editor.totalAmount)}
                </span>
              </p>
            ) : null}

            {editor.fieldErr ? (
              <p className="text-destructive text-sm" role="alert">
                {editor.fieldErr}
              </p>
            ) : null}
            {editor.submitErr ? (
              <p className="text-destructive text-sm" role="alert" aria-live="assertive">
                {editor.submitErr}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={
                  editor.submitting ||
                  refsLoading ||
                  Boolean(refsErr) ||
                  guests.length === 0 ||
                  rooms.length === 0
                }
              >
                {editor.submitting
                  ? 'Saving…'
                  : mode === 'create'
                    ? 'Create reservation'
                    : 'Save changes'}
              </Button>
              <Button type="button" variant="outline" asChild disabled={editor.submitting}>
                <Link to="/reservations">Cancel</Link>
              </Button>
              {mode === 'edit' ? (
                <Button
                  type="button"
                  variant="destructive"
                  className="sm:ml-auto"
                  disabled={editor.submitting}
                  onClick={() => {
                    setDeleteErr(null);
                    editor.setDeleteOpen(true);
                  }}
                >
                  Delete
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={editor.deleteOpen} onOpenChange={editor.setDeleteOpen}>
        <DialogContent aria-describedby="delete-form-desc">
          <DialogHeader>
            <DialogTitle>Delete this reservation?</DialogTitle>
            <DialogDescription id="delete-form-desc">
              This cannot be undone. The room will be available for other bookings (subject to
              overlap rules).
            </DialogDescription>
          </DialogHeader>
          {editor.deleteErr ? (
            <p className="text-destructive text-sm" role="alert">
              {editor.deleteErr}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => editor.setDeleteOpen(false)}
              disabled={editor.deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={editor.deleting}
              onClick={() => void editor.confirmDelete()}
            >
              {editor.deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
