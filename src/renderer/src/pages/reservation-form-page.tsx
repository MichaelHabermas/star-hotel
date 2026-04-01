import type { FormEvent, JSX } from 'react'
import { useCallback, useEffect, useId, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@renderer/components/ui/select'
import { useStarHotelApp } from '@renderer/lib/use-star-hotel-app'
import { reservationCreateBodySchema, reservationUpdateBodySchema } from '@shared/schemas/reservation'
import type { GuestResponse } from '@shared/schemas/guest'
import type { RoomResponse } from '@shared/schemas/room'

type ReservationFormPageProps = {
  readonly mode: 'create' | 'edit'
}

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })

export function ReservationFormPage({ mode }: ReservationFormPageProps): JSX.Element {
  const starHotel = useStarHotelApp()
  const navigate = useNavigate()
  const { reservationId: idParam } = useParams<{ reservationId: string }>()
  const formId = useId()
  const guestSelectId = `${formId}-guest`
  const roomSelectId = `${formId}-room`
  const checkInId = `${formId}-checkin`
  const checkOutId = `${formId}-checkout`

  const editId = mode === 'edit' && idParam ? Number.parseInt(idParam, 10) : NaN
  const editIdValid = mode === 'edit' && Number.isFinite(editId) && editId > 0

  const [guests, setGuests] = useState<GuestResponse[]>([])
  const [rooms, setRooms] = useState<RoomResponse[]>([])
  const [refsLoading, setRefsLoading] = useState(true)

  const [guestId, setGuestId] = useState<string>('')
  const [roomId, setRoomId] = useState<string>('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [totalAmount, setTotalAmount] = useState<number | null>(null)

  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [loadErr, setLoadErr] = useState<string | null>(null)

  const [submitErr, setSubmitErr] = useState<string | null>(null)
  const [fieldErr, setFieldErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteErr, setDeleteErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setRefsLoading(true)
      try {
        const [g, r] = await Promise.all([
          starHotel.api.guests.list({}),
          starHotel.api.rooms.list({}),
        ])
        if (!cancelled) {
          setGuests(g)
          setRooms(r)
        }
      } finally {
        if (!cancelled) {
          setRefsLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [starHotel])

  const loadReservation = useCallback(async () => {
    if (!editIdValid) {
      return
    }
    setLoadState('loading')
    setLoadErr(null)
    try {
      const res = await starHotel.api.reservations.get(editId)
      setGuestId(String(res.guestId))
      setRoomId(String(res.roomId))
      setCheckInDate(res.checkInDate)
      setCheckOutDate(res.checkOutDate)
      setTotalAmount(res.totalAmount)
      setLoadState('ok')
    } catch (err) {
      setLoadState('err')
      setLoadErr(starHotel.formatEmbeddedApiUserMessage(err))
    }
  }, [editIdValid, editId, starHotel])

  useEffect(() => {
    if (mode === 'edit') {
      void loadReservation()
    } else {
      setLoadState('ok')
      setLoadErr(null)
    }
  }, [mode, loadReservation])

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setSubmitErr(null)
    setFieldErr(null)

    if (mode === 'create') {
      const parsed = reservationCreateBodySchema.safeParse({
        roomId,
        guestId,
        checkInDate,
        checkOutDate,
      })
      if (!parsed.success) {
        const first = parsed.error.issues[0]
        setFieldErr(first?.message ?? 'Invalid input')
        return
      }
      setSubmitting(true)
      try {
        await starHotel.api.reservations.create(parsed.data)
        navigate('/reservations')
      } catch (err) {
        setSubmitErr(starHotel.formatEmbeddedApiUserMessage(err))
      } finally {
        setSubmitting(false)
      }
      return
    }

    if (!editIdValid) {
      return
    }

    const body: Record<string, unknown> = {}
    if (roomId !== '') {
      body.roomId = roomId
    }
    if (guestId !== '') {
      body.guestId = guestId
    }
    if (checkInDate !== '') {
      body.checkInDate = checkInDate
    }
    if (checkOutDate !== '') {
      body.checkOutDate = checkOutDate
    }

    const parsed = reservationUpdateBodySchema.safeParse(body)
    if (!parsed.success) {
      const first = parsed.error.issues[0]
      setFieldErr(first?.message ?? 'Invalid input')
      return
    }

    setSubmitting(true)
    try {
      const updated = await starHotel.api.reservations.update(editId, parsed.data)
      setTotalAmount(updated.totalAmount)
      navigate('/reservations')
    } catch (err) {
      setSubmitErr(starHotel.formatEmbeddedApiUserMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmDelete(): Promise<void> {
    if (!editIdValid) {
      return
    }
    setDeleting(true)
    setDeleteErr(null)
    try {
      await starHotel.api.reservations.delete(editId)
      setDeleteOpen(false)
      navigate('/reservations')
    } catch (err) {
      setDeleteErr(starHotel.formatEmbeddedApiUserMessage(err))
    } finally {
      setDeleting(false)
    }
  }

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
    )
  }

  if (mode === 'edit' && (loadState === 'loading' || loadState === 'idle')) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
          Loading reservation…
        </p>
      </div>
    )
  }

  if (mode === 'edit' && loadState === 'err') {
    return (
      <div className="mx-auto max-w-lg p-6 space-y-4">
        <p className="text-destructive text-sm" role="alert">
          {loadErr}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void loadReservation()}>
            Retry
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link to="/reservations">Back to list</Link>
          </Button>
        </div>
      </div>
    )
  }

  const title = mode === 'create' ? 'New reservation' : `Edit reservation #${editId}`
  const description =
    mode === 'create'
      ? 'Select guest, room, and stay dates. Total is calculated on the server.'
      : 'Update stay details. Total is recalculated when dates or room change.'

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
          <CardTitle>{title}</CardTitle>
          <CardDescription id={`${formId}-hint`}>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id={formId}
            onSubmit={(e) => void onSubmit(e)}
            className="space-y-6"
            noValidate
            aria-describedby={`${formId}-hint`}
          >
            {refsLoading ? (
              <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
                Loading guests and rooms…
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor={guestSelectId}>Guest</Label>
              <Select
                value={guestId === '' ? undefined : guestId}
                onValueChange={setGuestId}
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
                value={roomId === '' ? undefined : roomId}
                onValueChange={setRoomId}
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
                  value={checkInDate}
                  onChange={(ev) => setCheckInDate(ev.target.value)}
                  required
                  aria-required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={checkOutId}>Check-out date</Label>
                <Input
                  id={checkOutId}
                  type="date"
                  value={checkOutDate}
                  onChange={(ev) => setCheckOutDate(ev.target.value)}
                  required
                  aria-required
                />
              </div>
            </div>

            {mode === 'edit' && totalAmount !== null ? (
              <p className="text-muted-foreground text-sm">
                Current total: <span className="text-foreground font-medium">{money.format(totalAmount)}</span>
              </p>
            ) : null}

            {fieldErr ? (
              <p className="text-destructive text-sm" role="alert">
                {fieldErr}
              </p>
            ) : null}
            {submitErr ? (
              <p className="text-destructive text-sm" role="alert" aria-live="assertive">
                {submitErr}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={submitting || refsLoading}>
                {submitting ? 'Saving…' : mode === 'create' ? 'Create reservation' : 'Save changes'}
              </Button>
              <Button type="button" variant="outline" asChild disabled={submitting}>
                <Link to="/reservations">Cancel</Link>
              </Button>
              {mode === 'edit' ? (
                <Button
                  type="button"
                  variant="destructive"
                  className="sm:ml-auto"
                  disabled={submitting}
                  onClick={() => {
                    setDeleteErr(null)
                    setDeleteOpen(true)
                  }}
                >
                  Delete
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent aria-describedby="delete-form-desc">
          <DialogHeader>
            <DialogTitle>Delete this reservation?</DialogTitle>
            <DialogDescription id="delete-form-desc">
              This cannot be undone. The room will be available for other bookings (subject to overlap
              rules).
            </DialogDescription>
          </DialogHeader>
          {deleteErr ? (
            <p className="text-destructive text-sm" role="alert">
              {deleteErr}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
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
